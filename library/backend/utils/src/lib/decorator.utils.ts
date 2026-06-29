import { applyDecorators, HttpCode, HttpStatus, Type, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export interface ApiResourceOptions {
    operationId: string;
    status?: HttpStatus;
    summary?: string;
    description?: string;
    type?: Type<unknown>;
    tags?: string[];
}

/**
 * Adds a resource to the Swagger API.
 * uses the @ApiTags decorator to add tags to the resource.
 * uses the @HttpCode decorator to set the HTTP status code for the resource.
 * uses the @ApiOperation decorator to set the operation ID, summary, and description for the resource.
 * uses the @ApiResponse decorator to set the response type and status for the resource.
 * Example:
 * ```ts
 * @ApiResource({ operationId: 'signUp', status: HttpStatus.CREATED, type: SignUpResponseDto })
 * async signUp(@Body() dto: SignUpDto) {
 *     return this.appService.signUp(dto);
 * }
 * ```
 * @param options - The options for the resource.
 * @returns A decorator that adds a resource to the Swagger API.
 */
export const ApiResource = (options: ApiResourceOptions) => {
    return applyDecorators(
        ApiTags(...(options.tags ?? [])),
        HttpCode(options.status ?? HttpStatus.OK),
        ApiOperation({ operationId: options.operationId, summary: options.summary, description: options.description }),
        ApiResponse({ type: options.type, status: options.status ?? HttpStatus.OK, description: options.description }),
    );
};

/**
 * Adds exceptions for the given statuses.
 * uses the @ApiResponse decorator to set the response type and status for the exceptions.
 * Example:
 * ```ts
 * @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT)
 * async signUp(@Body() dto: SignUpDto) {
 *     return this.appService.signUp(dto);
 * }
 * ```
 * @param statuses - The statuses to add exceptions for.
 * @returns A decorator that adds exceptions for the given statuses.
 */
export const ApiResourceExceptions = (...statuses: Array<HttpStatus>) => {
    const exceptions = statuses.map((status) => ApiResponse({ status, description: `Exception for status ${status}` }));
    return applyDecorators(...exceptions);
};

/**
 * Adds single-file multipart upload support to a route handler.
 * uses the @ApiConsumes decorator to declare the `multipart/form-data` content type.
 * uses the @ApiBody decorator to describe the binary file field for Swagger/OpenAPI generation.
 * uses the @UseInterceptors decorator with NestJS's @FileInterceptor to extract the file from the request.
 * Example:
 * ```ts
 * @Post('me/avatar')
 * @ApiResourceFileUpload()
 * async uploadMyAvatar(@CurrentSession('userId') userId: string, @UploadedFile() file: Express.Multer.File) {
 *     return this.appService.uploadAvatar(userId, file);
 * }
 * ```
 * @param fieldName - The multipart form field name the file is sent under (passed to both @FileInterceptor and the OpenAPI schema). Defaults to `'file'`.
 * @returns A decorator that adds single-file multipart upload support to a route handler.
 */
export const ApiResourceFileUpload = (fieldName = 'file') => {
    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiBody({ schema: { type: 'object', properties: { [fieldName]: { type: 'string', format: 'binary' } } } }),
        UseInterceptors(FileInterceptor(fieldName)),
    );
};
