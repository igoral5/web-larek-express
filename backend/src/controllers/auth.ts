import {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import User from '../models/user';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import {
  ACCESS_TOKEN_EXPIRY,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRY,
} from '../config';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: ms(REFRESH_TOKEN_EXPIRY),
  path: '/',
};

const createTokens = (userId: string) => ({
  accessToken: jwt.sign({ _id: userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY }),
  refreshToken: jwt.sign({ _id: userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY }),
});

const MAX_REFRESH_TOKENS = 5;

const addRefreshToken = (tokens: { token: string }[], refreshToken: string) => {
  tokens.push({ token: refreshToken });
  if (tokens.length > MAX_REFRESH_TOKENS) {
    tokens.splice(0, tokens.length - MAX_REFRESH_TOKENS);
  }
};

const getUserId = (refreshToken: string | undefined) => {
  try {
    const { _id } = jwt.verify(refreshToken as string, JWT_SECRET) as { _id: string };
    return _id;
  } catch {
    throw new UnauthorizedError('Необходима авторизация');
  }
};

const getPublicUser = (user: { name: string; email: string }) => ({
  name: user.name,
  email: user.email,
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +tokens');
    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }

    const tokens = createTokens(user._id.toString());
    addRefreshToken(user.tokens, tokens.refreshToken);
    await user.save();

    res
      .cookie('refreshToken', tokens.refreshToken, cookieOptions)
      .send({ success: true, user: getPublicUser(user), accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    const tokens = createTokens(user._id.toString());
    addRefreshToken(user.tokens, tokens.refreshToken);
    await user.save();

    res
      .status(201)
      .cookie('refreshToken', tokens.refreshToken, cookieOptions)
      .send({ success: true, user: getPublicUser(user), accessToken: tokens.accessToken });
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError('Пользователь с таким email уже существует'));
      return;
    }
    next(error);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    const userId = getUserId(refreshToken);
    const user = await User.findById(userId).select('+tokens');

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    if (!user.tokens.some(({ token }) => token === refreshToken)) {
      throw new UnauthorizedError('Необходима авторизация');
    }

    const tokens = createTokens(userId);
    user.tokens = user.tokens.filter(({ token }) => token !== refreshToken);
    addRefreshToken(user.tokens, tokens.refreshToken);
    await user.save();

    res
      .cookie('refreshToken', tokens.refreshToken, cookieOptions)
      .send({ success: true, user: getPublicUser(user), accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    const userId = getUserId(refreshToken);
    const user = await User.findById(userId).select('+tokens');

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    user.tokens = user.tokens.filter(({ token }) => token !== refreshToken);
    await user.save();

    res.clearCookie('refreshToken', cookieOptions).send({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.send({ success: true, user });
  } catch (error) {
    next(error);
  }
};
