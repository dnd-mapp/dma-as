import { Reflector } from '@nestjs/core';
import { RoleName } from '../models';

export const HasRole = Reflector.createDecorator<RoleName>();
