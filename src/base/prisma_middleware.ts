import { Prisma, PrismaClient } from "@prisma/client";
import { DynamicClientExtensionThis, InternalArgs } from "@prisma/client/runtime/library";

/**
 * Creates an extended Prisma client with soft-delete functionality.
 * @param prisma The base PrismaClient instance.
 * @param modelsToSoftDelete An array of model names to apply the soft-delete logic to.
 * @returns A new, extended PrismaClient instance.
 */
export const getPrismaClientWithSoftDelete = (
    prisma: PrismaClient
): PrismaClient => {
    return prisma.$extends({
        query: {
        $allModels: {
            async $allOperations({ operation, args, query }) {
            // Check if the current model is in the list for soft-deletes

            // Intercept 'delete' and 'deleteMany' and convert them to 'update'
            if (operation === 'delete') {
                operation = 'update';
                args = { ...args, data: { deleted_at: new Date() } };
            } else if (operation === 'deleteMany') {
                operation = 'updateMany';
                args = { ...args, data: { deleted_at: new Date() } };
            }

            // For all find and update queries, automatically filter out deleted records
            const readOrUpdateActions: Prisma.PrismaAction[] = [
                'findUnique', 'findUniqueOrThrow',
                'findFirst', 'findFirstOrThrow',
                'findMany',
                'update', 'updateMany',
                'upsert',
                'count'
            ];
            
            if (readOrUpdateActions.includes(operation)) {
                if (args && 'where' in args) {
                args = {
                    ...args,
                    where: { ...args.where, deleted_at: null }
                };
                } else {
                args = {
                    ...args,
                    where: { deleted_at: null }
                };
                }
            }

            return query(args);
            },
        },
        },
    }) as PrismaClient;
};