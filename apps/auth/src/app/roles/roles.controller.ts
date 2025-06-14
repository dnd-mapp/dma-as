import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationGuard, CreateRoleData, HasRole, Role, Roles } from '../shared';
import { RolesService } from './roles.service';

@Controller('roles')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthenticationGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @HasRole(Roles.ADMIN)
    @Get()
    public async getAll() {
        return await this.rolesService.getAll();
    }

    @HasRole(Roles.ADMIN)
    @Post()
    public async create(@Body() data: CreateRoleData, @Res({ passthrough: true }) response: FastifyReply) {
        const role = await this.rolesService.create(data);

        response
            .status(HttpStatus.CREATED)
            .headers({ location: `${response.request.url}/${role.id}` })
            .send(role);
    }

    @HasRole(Roles.ADMIN)
    @Get(':roleId')
    public async getById(@Param('roleId') roleIdParam: string) {
        const role = await this.rolesService.getById(roleIdParam);

        if (!role) throw new NotFoundException(`Role with ID "${roleIdParam}" was not found`);
        return role;
    }

    @HasRole(Roles.ADMIN)
    @Put(':roleId')
    public async update(@Param('roleId') roleIdParam: string, @Body() data: Role, @Req() request: FastifyRequest) {
        if (roleIdParam !== data.id) {
            throw new BadRequestException(
                `It is not allowed to update Role on path "${request.url}" with data from Role with ID "${roleIdParam}"`
            );
        }
        return await this.rolesService.update(data);
    }

    @HasRole(Roles.ADMIN)
    @Delete(':roleId')
    public async remove(@Param('roleId') roleIdParam: string) {
        await this.rolesService.removeById(roleIdParam);
    }
}
