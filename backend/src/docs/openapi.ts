const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
});

const productIdParameter = {
  name: 'productId',
  in: 'path',
  required: true,
  description: 'Идентификатор товара',
  schema: { type: 'string', pattern: '^[0-9a-f]{24}$', example: '66601a8c57ecac94459696d6' },
};

const refreshCookieHeader = {
  description: 'httpOnly-кука с refresh-токеном',
  schema: {
    type: 'string',
    example: 'refreshToken=******; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax',
  },
};

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'WebLarek API',
    version: '1.0.0',
    description: 'API сервиса «Web-ларёк»: товары, заказы, авторизация и загрузка изображений.',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Локальный сервер' },
  ],
  tags: [
    { name: 'Product', description: 'Товары' },
    { name: 'Order', description: 'Заказы' },
    { name: 'Auth', description: 'Регистрация, авторизация и работа с токенами' },
    { name: 'Upload', description: 'Загрузка изображений товаров' },
  ],
  paths: {
    '/product': {
      get: {
        tags: ['Product'],
        summary: 'Получить все товары',
        responses: {
          200: {
            description: 'Список товаров',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductList' },
              },
            },
          },
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
      post: {
        tags: ['Product'],
        summary: 'Создать товар',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } },
          },
        },
        responses: {
          200: {
            description: 'Созданный товар',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Product' } },
            },
          },
          400: errorResponse('Некорректные данные товара'),
          401: errorResponse('Необходима авторизация'),
          409: errorResponse('Товар с таким названием уже существует'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
    },
    '/product/{productId}': {
      parameters: [productIdParameter],
      patch: {
        tags: ['Product'],
        summary: 'Обновить товар',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ProductUpdate' } },
          },
        },
        responses: {
          200: {
            description: 'Обновлённый товар',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Product' } },
            },
          },
          400: errorResponse('Некорректные данные или невалидный id товара'),
          401: errorResponse('Необходима авторизация'),
          404: errorResponse('Товар не найден'),
          409: errorResponse('Товар с таким названием уже существует'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
      delete: {
        tags: ['Product'],
        summary: 'Удалить товар',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Удалённый товар',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Product' } },
            },
          },
          400: errorResponse('Невалидный id товара'),
          401: errorResponse('Необходима авторизация'),
          404: errorResponse('Товар не найден'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
    },
    '/order': {
      post: {
        tags: ['Order'],
        summary: 'Оформить заказ',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/OrderInput' } },
          },
        },
        responses: {
          200: {
            description: 'Заказ оформлен',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/OrderResult' } },
            },
          },
          400: errorResponse('Некорректные данные заказа'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Зарегистрировать пользователя',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  name: {
                    type: 'string', minLength: 2, maxLength: 30, example: 'Максим',
                  },
                  email: { type: 'string', format: 'email', example: 'admin@ya.ru' },
                  password: { type: 'string', minLength: 6, example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Пользователь зарегистрирован',
            headers: { 'Set-Cookie': refreshCookieHeader },
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          400: errorResponse('Некорректные email или пароль'),
          409: errorResponse('Пользователь с таким email уже существует'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Аутентифицировать пользователя',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@ya.ru' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Пользователь аутентифицирован',
            headers: { 'Set-Cookie': refreshCookieHeader },
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          400: errorResponse('Не переданы email или пароль'),
          401: errorResponse('Неправильные почта или пароль'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
    },
    '/auth/token': {
      get: {
        tags: ['Auth'],
        summary: 'Выпустить новую пару токенов',
        description: 'Принимает refresh-токен из httpOnly-куки refreshToken и возвращает новую пару токенов.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Новая пара токенов',
            headers: { 'Set-Cookie': refreshCookieHeader },
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          401: errorResponse('Токен отсутствует, просрочен или невалиден'),
          404: errorResponse('Пользователь не найден'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
    },
    '/auth/logout': {
      get: {
        tags: ['Auth'],
        summary: 'Выйти из аккаунта',
        description: 'Удаляет refresh-токен из базы и очищает httpOnly-куку refreshToken.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Выход выполнен',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean', example: true } } },
              },
            },
          },
          400: errorResponse('Невалидный id пользователя в токене'),
          401: errorResponse('Необходима авторизация'),
          404: errorResponse('Пользователь не найден'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
    },
    '/auth/user': {
      get: {
        tags: ['Auth'],
        summary: 'Получить текущего пользователя',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Данные пользователя',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } },
            },
          },
          401: errorResponse('Необходима авторизация'),
          404: errorResponse('Пользователь не найден'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
    },
    '/upload': {
      post: {
        tags: ['Upload'],
        summary: 'Загрузить изображение',
        description: 'Сохраняет файл во временную папку и возвращает его имя для передачи в поле image товара.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: { file: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Файл загружен',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UploadResult' } },
            },
          },
          400: errorResponse('Файл не передан, не изображение или превышает 5 МБ'),
          401: errorResponse('Необходима авторизация'),
          500: errorResponse('Ошибка по умолчанию'),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'refreshToken' },
    },
    schemas: {
      Image: {
        type: 'object',
        required: ['fileName', 'originalName'],
        properties: {
          fileName: { type: 'string', example: '/images/Asterisk_2.png' },
          originalName: { type: 'string', example: 'Asterisk_2.png' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66601a8c57ecac94459696d6' },
          title: { type: 'string', example: 'Мамка-таймер' },
          image: { $ref: '#/components/schemas/Image' },
          category: { type: 'string', example: 'софт-скил' },
          description: { type: 'string', example: 'Будет стоять над душой и не давать прокрастинировать.' },
          price: {
            type: 'number', nullable: true, minimum: 0, example: 750,
          },
        },
      },
      ProductInput: {
        type: 'object',
        required: ['title', 'image', 'category'],
        properties: {
          title: {
            type: 'string', minLength: 2, maxLength: 30, example: 'Мамка-таймер',
          },
          image: { $ref: '#/components/schemas/Image' },
          category: { type: 'string', example: 'софт-скил' },
          description: { type: 'string', example: 'Будет стоять над душой и не давать прокрастинировать.' },
          price: {
            type: 'number', nullable: true, minimum: 0, default: null, example: 750,
          },
        },
      },
      ProductUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 2, maxLength: 30 },
          image: { $ref: '#/components/schemas/Image' },
          category: { type: 'string' },
          description: { type: 'string' },
          price: {
            type: 'number', nullable: true, minimum: 0,
          },
        },
      },
      ProductList: {
        type: 'object',
        required: ['items', 'total'],
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
          total: { type: 'integer', example: 1 },
        },
      },
      OrderInput: {
        type: 'object',
        required: ['payment', 'email', 'phone', 'address', 'total', 'items'],
        properties: {
          payment: { type: 'string', enum: ['card', 'online'], example: 'card' },
          email: { type: 'string', format: 'email', example: 'admin@ya.ru' },
          phone: { type: 'string', example: '+7999999999' },
          address: { type: 'string', example: 'Санкт-Петербург, ул. Восстания, 1' },
          total: { type: 'number', example: 2200 },
          items: {
            type: 'array',
            minItems: 1,
            items: { type: 'string', pattern: '^[0-9a-f]{24}$', example: '662e97d0c2fed29cab5bf3db' },
          },
        },
      },
      OrderResult: {
        type: 'object',
        required: ['id', 'total'],
        properties: {
          id: { type: 'string', format: 'uuid', example: 'c1f83572-e756-4f82-809b-4c710fe51087' },
          total: { type: 'number', example: 2200 },
        },
      },
      User: {
        type: 'object',
        required: ['email', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@ya.ru' },
          name: { type: 'string', example: 'Максим' },
        },
      },
      AuthResponse: {
        type: 'object',
        required: ['success', 'user', 'accessToken'],
        properties: {
          success: { type: 'boolean', example: true },
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      UserResponse: {
        type: 'object',
        required: ['success', 'user'],
        properties: {
          success: { type: 'boolean', example: true },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      UploadResult: {
        type: 'object',
        required: ['fileName', 'originalName'],
        properties: {
          fileName: { type: 'string', example: '/images/686ade58.png' },
          originalName: { type: 'string', example: '5_Dots.png' },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['message'],
        properties: { message: { type: 'string', example: 'Ошибка валидации данных' } },
      },
    },
  },
};

export default openapi;
