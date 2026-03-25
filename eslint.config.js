const { defineConfig } = require('eslint/config');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const securityPlugin = require('eslint-plugin-security');
const noSecretsPlugin = require('eslint-plugin-no-secrets');

const sqlInjectionRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'detect possible SQL injection in query execution',
    },
    schema: [],
    messages: {
      possibleSqlInjection: 'Potential SQL injection detected. Use parameterized queries.',
    },
  },
  create(context) {
    const isUnsafeSqlArgument = (argument) => {
      if (!argument) {
        return false;
      }

      if (argument.type === 'TemplateLiteral') {
        return argument.expressions.length > 0;
      }

      if (argument.type === 'BinaryExpression' && argument.operator === '+') {
        return true;
      }

      return false;
    };

    const isQueryCall = (callee) => {
      if (!callee) {
        return false;
      }

      if (callee.type === 'Identifier') {
        return ['query', 'execute', 'raw'].includes(callee.name);
      }

      if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
        return ['query', 'execute', 'raw'].includes(callee.property.name);
      }

      return false;
    };

    return {
      CallExpression(node) {
        if (!isQueryCall(node.callee)) {
          return;
        }

        if (isUnsafeSqlArgument(node.arguments[0])) {
          context.report({ node, messageId: 'possibleSqlInjection' });
        }
      },
    };
  },
};

module.exports = defineConfig([
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooksPlugin,
      security: {
        ...securityPlugin,
        rules: {
          ...securityPlugin.rules,
          'detect-sql-injection': sqlInjectionRule,
        },
      },
      'no-secrets': noSecretsPlugin,
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'security/detect-sql-injection': 'error',
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'no-secrets/no-secrets': ['error', { tolerance: 4.5 }],
    },
  },
]);
