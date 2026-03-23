import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
   constructor(
    private usersService: UsersService,
    private jwtService: JwtService 
  ) {}

}
