import { BeforeApplicationShutdown, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, BeforeApplicationShutdown {
    public async onModuleInit() {
        this.$connect();
    }

    public async beforeApplicationShutdown() {
        await this.$disconnect();
    }
}
