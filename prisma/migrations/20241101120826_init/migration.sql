-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('WAITING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELED', 'SUCCESSFUL_TRANSFER');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "nominalAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "fineAmount" DOUBLE PRECISION NOT NULL,
    "interestAmount" DOUBLE PRECISION NOT NULL,
    "expiration" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "fine" DOUBLE PRECISION NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "brcode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "due" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" INTEGER NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
