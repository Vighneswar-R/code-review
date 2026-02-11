/*
  Warnings:

  - You are about to drop the column `branch_id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `CollectionFollowUp` DROP FOREIGN KEY `CollectionFollowUp_case_id_fkey`;

-- DropForeignKey
ALTER TABLE `LegalCaseEvidences` DROP FOREIGN KEY `LegalCaseEvidences_legal_case_id_fkey`;

-- DropForeignKey
ALTER TABLE `PaymentCollect` DROP FOREIGN KEY `PaymentCollect_case_id_fkey`;

-- DropForeignKey
ALTER TABLE `SoaPropertyDetail` DROP FOREIGN KEY `SoaPropertyDetail_case_id_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_branch_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserMapping` DROP FOREIGN KEY `UserMapping_employee_code_fkey`;

-- DropIndex
DROP INDEX `CollectionFollowUp_case_id_loan_number_co_id_idx` ON `CollectionFollowUp`;

-- DropIndex
DROP INDEX `LegalCaseEvidences_legal_case_id_loan_number_evidence_type_idx` ON `LegalCaseEvidences`;

-- DropIndex
DROP INDEX `PaymentCollect_case_id_loan_number_invoice_number_mobile_num_idx` ON `PaymentCollect`;

-- DropIndex
DROP INDEX `SoaPropertyDetail_case_id_loan_number_idx` ON `SoaPropertyDetail`;

-- DropIndex
DROP INDEX `User_branch_id_fkey` ON `User`;

-- DropIndex
DROP INDEX `UserMapping_employee_code_map_type_manager_code_idx` ON `UserMapping`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `branch_id`;

-- CreateTable
CREATE TABLE `BranchMapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `branch_id` INTEGER NULL,
    `is_active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CollectionFollowUp_case_id_loan_number_co_id_idx` ON `CollectionFollowUp`(`case_id`, `loan_number`(191), `co_id`);

-- CreateIndex
CREATE INDEX `LegalCaseEvidences_legal_case_id_loan_number_evidence_type_idx` ON `LegalCaseEvidences`(`legal_case_id`, `loan_number`(191), `evidence_type`(191));

-- CreateIndex
CREATE INDEX `PaymentCollect_case_id_loan_number_invoice_number_mobile_num_idx` ON `PaymentCollect`(`case_id`, `loan_number`(191), `invoice_number`(191), `mobile_number`(191));

-- CreateIndex
CREATE INDEX `SoaPropertyDetail_case_id_loan_number_idx` ON `SoaPropertyDetail`(`case_id`, `loan_number`(191));

-- CreateIndex
CREATE INDEX `UserMapping_employee_code_map_type_manager_code_idx` ON `UserMapping`(`employee_code`(191), `map_type`(191), `manager_code`(191));

-- AddForeignKey
ALTER TABLE `CollectionFollowUp` ADD CONSTRAINT `CollectionFollowUp_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LegalCaseEvidences` ADD CONSTRAINT `LegalCaseEvidences_legal_case_id_fkey` FOREIGN KEY (`legal_case_id`) REFERENCES `LegalCases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentCollect` ADD CONSTRAINT `PaymentCollect_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaPropertyDetail` ADD CONSTRAINT `SoaPropertyDetail_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoles` ADD CONSTRAINT `UserRoles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchMapping` ADD CONSTRAINT `BranchMapping_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `BranchMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchMapping` ADD CONSTRAINT `BranchMapping_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
