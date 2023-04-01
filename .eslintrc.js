// module.exports = {
//   /*
//     1. eslint не видит конфиг в create-react-app, скорее всего это связано с yarn 2.
//     https://github.com/facebook/create-react-app/issues/10718
//     Пришлось установить все зависимости eslint-config-react-app.
//     https://github.com/facebook/create-react-app/tree/main/packages/eslint-config-react-app#usage-outside-of-create-react-app
//     2. plugin:prettier/recommended - должен быть последним в списке.
//     https://github.com/prettier/eslint-config-prettier#installation
//   */
//   extends: [
//     'react-app', // см. пункт 1
//     'plugin:prettier/recommended', // см. пункт 2
//   ],
//   plugins: ['jsdoc'],
//   rules: {
//     /*
//       Общие правила
//       TODO: Добавить линт для переноса на новую строку при деструктуризации объектов - если больше 3 параметром,
//       то горизонтально, иначе вертикально. Если так не получится, можно сделать всегда вертикально.
//       https://stash.ideco.dev/projects/UTM/repos/web-modules/pull-requests/1978/overview?commentId=211675
//     */
//     curly: 'error',
//     /*
//       Правила react: для нового синтаксиса jsx-transform нужно отключить несколько правил.
//       https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#eslint
//     */
//     'react/jsx-uses-react': 'off',
//     'react/react-in-jsx-scope': 'off',
//     /*
//       Правила react-hooks: проставлять зависимости useEffect удобнее вручную.
//     */
//     'react-hooks/exhaustive-deps': 'off',

//     /**
//       Правила import.
//       @see https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
//     */
//     'import/order': [
//       'error',
//       {
//         'newlines-between': 'never',
//         alphabetize: {
//           order: 'asc',
//           caseInsensitive: false,
//         },
//         groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
//         pathGroups: [
//           // react должен быть в начале файла
//           {
//             pattern: 'react',
//             group: 'builtin',
//             position: 'before',
//           },
//           // импорты js-gane должны быть объединены и стоять сначала
//           {
//             pattern: 'js-game/**',
//             group: 'internal',
//             position: 'before',
//           },
//         ],
//         pathGroupsExcludedImportTypes: ['react'],
//       },
//     ],
//     'import/no-anonymous-default-export': 'off',
//     'import/newline-after-import': ['error'],

//     /**
//      * Правила для сортировки импортируемых типов/компонентов
//      * внутри одного импорта .
//      * @see https://eslint.org/docs/rules/sort-imports
//      * */
//     'sort-imports': [
//       'error',
//       {
//         ignoreCase: false,
//         ignoreDeclarationSort: true,
//         ignoreMemberSort: false,
//         memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
//         allowSeparatedGroups: false,
//       },
//     ],

//     /**
//      * Линтер на неиспользуемые переменные.
//      * В данном случае argsIgnorePattern позволяет игнорировать неиспользуемость
//      * переменных, начинающиющихся на _.
//      * @see https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-unused-vars.md
//      *
//      */
//     'no-unused-vars': 'off',
//     '@typescript-eslint/no-unused-vars': [
//       'error',
//       { vars: 'all', args: 'after-used', argsIgnorePattern: '^_' },
//     ],

//     /**
//      * Линт на обращение к несуществующим переменным.
//      * @see https://eslint.org/docs/rules/no-undef
//      */
//     'no-undef': 'error',
//     /**
//      * Линт на вывод в консоль.
//      * @see https://eslint.org/docs/rules/no-console
//      */
//     'no-console': ['error', { allow: ['warn', 'error'] }],
//   },
//   // Необходимо для того, чтобы можно было не линтить обращение к React и JSX
//   // правилом no-undef
//   globals: {
//     React: true,
//     JSX: true,
//   },
// };
