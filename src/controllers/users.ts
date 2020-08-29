import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '@src/models/users';
import { BaseController } from '.';
import { AuthService } from '@src/services/auth';

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
      return res.status(401).send({
        code: 401,
        error: 'User not found',
      });
    }

    if (!(await AuthService.comparePassword(password, user.password))) {
      return res.status(401).send({
        code: 401,
        error: 'Password does not match',
      });
    }
    const token = AuthService.generateToken(user.toJSON());
    res.status(200).send({ token: token });
  }
}
