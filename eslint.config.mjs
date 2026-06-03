import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import regexp from 'eslint-plugin-regexp';
import pluginImport from 'eslint-plugin-import';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '.tools/**',
      'api/**',           // 排除自动生成的 API 代码
      'src/api/**',       // 排除 src 下的自动生成 API
      '.expo/**',         // 排除 Expo 自动生成的文件
      'tailwind.config.js', // 排除 Tailwind 配置文件
      '**/*.d.ts',
      'eslint.config.*',
      'metro.config.*',
      './scripts/**',
    ],
  },
  regexp.configs["flat/recommended"],
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 禁用所有 react-hooks 规则（react-hooks 插件未正确配置）
  {
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },

  // React 的推荐配置
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

    // 语言选项：设置全局变量
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        '__DEV__': 'readonly',
      },
    },

    // React 版本自动检测
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
          alwaysTryTypes: true,
        },
      },
    },

    plugins: {
      import: pluginImport,
    },
    rules: {
      // 关闭代码风格规则
      'semi': 'off',
      'quotes': 'off',
      'indent': 'off',
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "no-unused-expressions": "warn",
      "no-useless-escape": "warn",
      'import/no-unresolved': 'error',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-prototype-builtins': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'prefer-const': 'off',
      // 禁用所有 react-hooks 规则（使用 react-hooks 插件时）
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      // 禁止使用 via.placeholder.com 服务
      'no-restricted-syntax': [
        'error',
        {
          'selector': 'Literal[value=/via\\.placeholder\\.com/]',
          'message': 'via.placeholder.com 服务不可用，禁止在代码中使用',
        },
        {
          'selector': 'TemplateLiteral > TemplateElement[value.raw=/via\\.placeholder\\.com/]',
          'message': 'via.placeholder.com 服务不可用，禁止在代码中使用',
        },
      ],
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-warning-comments': 'off',
    },
  },

  {
    files: [
      "metro.config.js",
      "scripts/**/*.js",
      "expo/scripts/**/*.js",
      "eslint.config.js",
      "babel.config.js",
      "server/**/*.js"
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // 在 .js 文件中关闭 TS 规则
      '@typescript-eslint/no-require-imports': 'off',
      // 在 Node.js 文件中允许 require
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
    },
  },
];
