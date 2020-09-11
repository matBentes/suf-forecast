import { Controller, Post, Get, Middleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '@src/models/users';
import { BaseController } from '.';
import { AuthService } from '@src/services/auth';
import { authMiddleware } from '@src/middlewares/auth';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(request: Request, response: Response): Promise<void> {
    try {
      const user = new User(request.body);
      const newUser = await user.save();
      response.status(201).send(newUser);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(response, error);
    }
  }

  @Post('authenticate')
  public async authenticate(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found',
        description: 'Try verifying your email address.',
      });
    }

    if (!(await AuthService.comparePassword(password, user.password))) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Password does not match',
      });
    }
    const token = AuthService.generateToken(user.toJSON());
    return res.send({ ...user.toJSON(), ...{ token } });
  }

  @Get('me')
  @Middleware(authMiddleware)
  public async me(req: Request, res: Response): Promise<Response> {
    const email = req.decoded ? req.decoded.email : undefined;
    const user = await User.findOne({ email });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User not found',
      });
    }
    return res.send({ user });
  }
}
