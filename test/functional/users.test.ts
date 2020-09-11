import { User } from '@src/models/users';
import { AuthService } from '@src/services/auth';

describe('User functional tests', () => {
  beforeEach(async () => await User.deleteMany({}));
  describe('When creating a new user', () => {
    it('should successfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(201);
      expect(
        AuthService.comparePassword(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
    });

    it('Should return a validation error when a field is missing', async () => {
      const newUser = {
        email: 'jhon@mail.com',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: 400,
        error: 'Bad Request',
        message: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('should return 409 when the email already exists', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '1234',
      };

      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'Conflict',
        message:
          'User validation failed: email: already exists in the database',
      });
    });
  });

  describe('When authenticating a user', () => {
    it('hould generate a token for a valid user', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@gmail.com',
        password: '1234',
      };

      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });

      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('should return UNAUTHORIZED if the user with the given email is not found', async () => {
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: 'jhon@gmail.com', password: '1234' });

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        code: 401,
        error: 'Unauthorized',
        message: 'User not found',
        description: 'Try verifying your email address.',
      });
    });

    it('should return UNATHOURIZED if the user is found but the password does not match', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@gmail.com',
        password: '1234',
      };

      await new User(newUser).save();

      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ ...newUser, password: '4321' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: 401,
        error: 'Unauthorized',
        message: 'Password does not match',
      });
    });
  });

  describe('When getting user profile info', () => {
    it(`should return the token's owner profile information`, async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '1234',
      };

      const user = await new User(newUser).save();
      const token = AuthService.generateToken(user.toJSON());
      const { body, status } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(200);
      expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
    });

    it(`should return not found, when the user is not found`, async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '1234',
      };

      const user = await new User(newUser);
      const token = AuthService.generateToken(user.toJSON());
      const { body, status } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(404);
      expect(body.message).toBe('User not found');
    });
  });
});
