/*
  Warnings:

  - The values [SUCCESSFUL_TRANSFER] on the enum `InvoiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `status` to the `Transfer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('CREATED', 'PROCESSING', 'CANCELED', 'FAILED', 'SUCCESS');

-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceStatus_new" AS ENUM ('WAITING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELED', 'TRANSFER_SOLICITED');
ALTER TABLE "Invoice" ALTER COLUMN "status" TYPE "InvoiceStatus_new" USING ("status"::text::"InvoiceStatus_new");
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";
ALTER TYPE "InvoiceStatus_new" RENAME TO "InvoiceStatus";
DROP TYPE "InvoiceStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "status" "TransferStatus" NOT NULL;
