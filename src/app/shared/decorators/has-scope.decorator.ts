import { Reflector } from '@nestjs/core';
import { ScopeName } from '../models';

export const HasScope = Reflector.createDecorator<ScopeName>();
