# Integración con NestJS Backend

Esta interfaz administrativa está diseñada para funcionar con cualquier backend REST API. Aquí te mostramos cómo integrarla con NestJS.

## 1. Estructura del Backend NestJS

### Controlador de Usuarios (users.controller.ts)
\`\`\`typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
\`\`\`

### DTOs (dto/user.dto.ts)
\`\`\`typescript
import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(['admin', 'user'])
  role: 'admin' | 'user';

  @IsEnum(['active', 'inactive'])
  status: 'active' | 'inactive';

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['admin', 'user'])
  role?: 'admin' | 'user';

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsString()
  avatar?: string;
}
\`\`\`

### Servicio (users.service.ts)
\`\`\`typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(search?: string): Promise<User[]> {
    if (search) {
      return this.usersRepository.find({
        where: [
          { name: Like(`%${search}%`) },
          { email: Like(`%${search}%`) }
        ],
        order: { createdAt: 'DESC' }
      });
    }
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }
}
\`\`\`

### Entidad (entities/user.entity.ts)
\`\`\`typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
  role: 'admin' | 'user';

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @Column({ nullable: true })
  avatar?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
\`\`\`

## 2. Configuración del Frontend

### Variables de Entorno (.env.local)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

### Configuración de API (lib/api.ts)
\`\`\`typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
\`\`\`

## 3. Pasos de Integración

1. **Instalar NestJS y dependencias**:
   \`\`\`bash
   npm i -g @nestjs/cli
   nest new backend-api
   cd backend-api
   npm install @nestjs/typeorm typeorm mysql2 class-validator class-transformer
   \`\`\`

2. **Configurar la base de datos** en `app.module.ts`

3. **Crear el módulo de usuarios**:
   \`\`\`bash
   nest generate module users
   nest generate controller users
   nest generate service users
   \`\`\`

4. **Actualizar el frontend** para usar las APIs reales (ver archivo actualizado)

5. **Configurar CORS** en NestJS:
   \`\`\`typescript
   // main.ts
   app.enableCors({
     origin: 'http://localhost:3000',
     credentials: true,
   });
   \`\`\`

6. **Ejecutar ambos proyectos**:
   \`\`\`bash
   # Backend (puerto 3001)
   npm run start:dev
   
   # Frontend (puerto 3000)
   npm run dev
   \`\`\`

## 4. Características Implementadas

✅ CRUD completo de usuarios
✅ Búsqueda en tiempo real
✅ Validación de datos
✅ Manejo de errores
✅ Interfaz responsive
✅ Sin autenticación (simplificado)
✅ Diseño limpio y moderno

La interfaz está lista para conectarse a tu backend NestJS siguiendo esta estructura de API REST estándar.
