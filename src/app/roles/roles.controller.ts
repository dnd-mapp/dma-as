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
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationGuard } from '../authentication';
import { CreateRoleData, Role } from '../shared';
import { RolesService } from './roles.service';

@Controller('roles')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthenticationGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get()
    public async getAll() {
        return await this.rolesService.getAll();
    }

    @Post()
    public async create(@Body() data: CreateRoleData, @Res({ passthrough: true }) response: FastifyReply) {
        const role = await this.rolesService.create(data);

        response
            .status(HttpStatus.CREATED)
            .headers({ location: `${response.request.url}/${role.id}` })
            .send(role);
    }

    @Get(':roleId')
    public async getById(@Param('roleId') roleIdParam: string) {
        const role = await this.rolesService.getById(roleIdParam);

        if (!role) throw new NotFoundException(`Role with ID "${roleIdParam}" was not found`);
        return role;
    }

    @Put(':roleId')
    public async update(@Param('roleId') roleIdParam: string, @Body() data: Role, @Req() request: FastifyRequest) {
        if (roleIdParam !== data.id) {
            throw new BadRequestException(
                `It is not allowed to update Role on path "${request.url}" with data from Role with ID "${roleIdParam}"`
            );
        }
        return await this.rolesService.update(data);
    }

    @Delete(':roleId')
    public async remove(@Param('roleId') roleIdParam: string) {
        await this.rolesService.removeById(roleIdParam);
    }
}
