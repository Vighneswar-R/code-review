-- CreateTable
CREATE TABLE `Allocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loan_number` TEXT NULL,
    `case_id` INTEGER NULL,
    `application_id` TEXT NULL,
    `person_email` TEXT NULL,
    `allocation_type` TEXT NULL,
    `uploaded_by` TEXT NULL,
    `active` BOOLEAN NULL,
    `rule_id` INTEGER NULL,
    `batch_id` INTEGER NULL,
    `master_id` INTEGER NULL,
    `co_code` VARCHAR(191) NOT NULL,
    `status` TEXT NULL,
    `ho_code` TEXT NULL,
    `zcm_code` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    INDEX `Allocation_loan_number_case_id_idx`(`loan_number`(191), `case_id`),
    INDEX `Allocation_master_id_idx`(`master_id`),
    INDEX `Allocation_co_code_idx`(`co_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AllocationMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NULL,
    `status` TEXT NULL,
    `total_cases` INTEGER NULL,
    `approved_by` TEXT NULL,
    `rejected_by` TEXT NULL,
    `fileName` TEXT NULL,
    `remarks` TEXT NULL,
    `successful_allocation` INTEGER NULL,
    `failed_allocation` INTEGER NULL,
    `uploaded_by` TEXT NULL,
    `processing_time` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    INDEX `AllocationMaster_status_active_idx`(`status`(191), `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AllocationRules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rule_type` TEXT NULL,
    `description` TEXT NULL,
    `name` TEXT NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `enable` BOOLEAN NULL DEFAULT true,
    `lastModifiedBy` TEXT NULL,
    `assigned_to` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `lastModified` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankBranchMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `BANK_ID` INTEGER NULL,
    `BANK_BRANCH_ID` INTEGER NULL,
    `BANK_BRANCH_NAME` TEXT NULL,
    `BRANCH_MICR_CODE` TEXT NULL,
    `BRANCH_IFCS_CODE` TEXT NULL,
    `ADDRESS_1` TEXT NULL,
    `ADDRESS_2` TEXT NULL,
    `ADDRESS_3` TEXT NULL,
    `REGION_ID` INTEGER NULL,
    `BRANCH_PINCODE` TEXT NULL,
    `DISPLAY_VALUE` TEXT NULL,
    `DISPLAY_ORDER` INTEGER NULL,
    `CURRENT_STATUS` INTEGER NULL,
    `status` INTEGER NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    INDEX `BankBranchMaster_BANK_ID_idx`(`BANK_ID`),
    INDEX `BankBranchMaster_REGION_ID_idx`(`REGION_ID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bankmaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bank_name` TEXT NULL,
    `bank_id` TEXT NULL,
    `display_name` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BcpCollection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` TEXT NULL,
    `type_id` INTEGER NULL,
    `url` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `udpated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_name` TEXT NULL,
    `collection_allowed` BOOLEAN NULL,
    `collection_type` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,
    `bank_account_id` TEXT NULL,
    `branch_code` TEXT NULL,
    `branch_display_value` TEXT NULL,
    `branch_emp_id` TEXT NULL,
    `branch_lon` TEXT NULL,
    `branch_lat` TEXT NULL,
    `branch_phone_1` TEXT NULL,
    `branch_phone_2` TEXT NULL,
    `branch_value` TEXT NULL,
    `dept_bank_account_id` TEXT NULL,
    `recipt_prefix` TEXT NULL,
    `region_id` INTEGER NULL,
    `zone_id` INTEGER NULL,
    `branch_address_1` TEXT NULL,
    `branch_address_2` TEXT NULL,

    INDEX `BranchMaster_region_id_idx`(`region_id`),
    INDEX `BranchMaster_zone_id_idx`(`zone_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CallDuration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `case_id` INTEGER NULL,
    `from` TEXT NULL,
    `to` TEXT NULL,
    `mobile_type` TEXT NULL,
    `call_duration` TEXT NULL,
    `date_time` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CallDuration_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `casetypemaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_type_name` TEXT NULL,
    `display_name` TEXT NULL,
    `startdate` DATETIME(3) NULL,
    `enddate` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_active` BOOLEAN NULL DEFAULT true,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CashDeposite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `opening_balance` INTEGER NOT NULL,
    `todays_cash_collected` INTEGER NOT NULL,
    `total_cash_to_deposite` INTEGER NOT NULL,
    `deposited_amount` INTEGER NOT NULL,
    `actual_deposited_amount` INTEGER NOT NULL,
    `extra_amount` INTEGER NULL,
    `call_charges` INTEGER NOT NULL DEFAULT 0,
    `visit_charges` INTEGER NOT NULL DEFAULT 0,
    `balance_cash_inhand` INTEGER NOT NULL,
    `roundof_amount` INTEGER NOT NULL,
    `pending_date` DATETIME(3) NOT NULL,
    `remark` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `receipt_name` VARCHAR(191) NOT NULL,
    `app_receipt_no` VARCHAR(191) NOT NULL,
    `app_receipt_date` VARCHAR(191) NOT NULL,
    `cashier_receipt_no` VARCHAR(191) NOT NULL,
    `cashier_receipt_name` VARCHAR(191) NOT NULL,
    `cashier_receipt_slip` VARCHAR(191) NOT NULL,
    `lat` TEXT NULL,
    `lon` TEXT NULL,
    `accuracy` TEXT NULL,
    `by_cron` INTEGER NOT NULL,
    `approved_by_cashier` INTEGER NOT NULL,
    `collected_by_cashier` INTEGER NOT NULL,
    `casher_approved_time` DATETIME(3) NOT NULL,
    `casher_collected_time` DATETIME(3) NOT NULL,
    `approved_by_accountant` INTEGER NOT NULL,
    `accountant_approved_time` DATETIME(3) NOT NULL,
    `approved_status` INTEGER NULL DEFAULT 0,
    `bank_name` TEXT NULL,
    `branch_name` TEXT NULL,
    `excel` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `CashDeposite_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChequeBounce` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `LOAN_BRANCH` VARCHAR(191) NOT NULL,
    `LOAN_NO` VARCHAR(191) NOT NULL,
    `case_id` INTEGER NOT NULL,
    `LOAN_CUSTOMER_NAME` VARCHAR(191) NOT NULL,
    `INSTRUMENT_NO` VARCHAR(191) NOT NULL,
    `INSTRUMENT_AMOUNT` VARCHAR(191) NOT NULL,
    `INSTRUMENT_DATE` DATETIME(3) NOT NULL,
    `RECEIPT_NO` VARCHAR(191) NOT NULL,
    `CHEQUE_NO` VARCHAR(191) NOT NULL,
    `PF_DEPO_BRANCH` VARCHAR(191) NOT NULL,
    `BOUNCE_REASON` VARCHAR(191) NOT NULL,
    `DEPO_BANK` VARCHAR(191) NOT NULL,
    `DEPO_BANK_BRANCH` VARCHAR(191) NOT NULL,
    `DEPO_BANK_ACC_NO` VARCHAR(191) NOT NULL,
    `ZONE` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `DEAL_BRANCH` VARCHAR(191) NOT NULL,
    `DEAL_NO` VARCHAR(191) NOT NULL,
    `DEAL_CUSTOMER_NAME` VARCHAR(191) NOT NULL,
    `VALUE_DATE` DATETIME(3) NOT NULL,
    `REC_STATUS` VARCHAR(191) NOT NULL,
    `CHEQUE_RECEIVED_TOWARDS` VARCHAR(191) NOT NULL,
    `CLUSTER` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ChequeBounce_case_id_idx`(`case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionAppCategoryMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionAppChargesMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `DISPLAY_VALUE` VARCHAR(191) NOT NULL,
    `multiples_amount` INTEGER NOT NULL,
    `count` INTEGER NOT NULL,
    `CURRENT_STATUS` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionAppFieldMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `DISPLAY_VALUE` VARCHAR(191) NOT NULL,
    `GENRIC_KEY` TEXT NULL,
    `PhotoRequire` INTEGER NULL,
    `bucket` INTEGER NULL,
    `followup_type` INTEGER NOT NULL DEFAULT 0,
    `is_remark` INTEGER NOT NULL DEFAULT 0,
    `is_image` INTEGER NOT NULL DEFAULT 0,
    `nxt_followup` INTEGER NOT NULL DEFAULT 0,
    `payment_type` INTEGER NOT NULL DEFAULT 0,
    `FIELD_ID` VARCHAR(191) NOT NULL,
    `DISPLAY_ORDER` INTEGER NOT NULL,
    `CURRENT_STATUS` INTEGER NOT NULL DEFAULT 1,
    `paid_visit` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionAppPaymentTypeMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NULL,
    `display_name` TEXT NULL,
    `mode_desp` TEXT NULL,
    `is_mobile_required` TEXT NULL,
    `is_paid_visit` INTEGER NOT NULL DEFAULT 0,
    `is_image_required` TEXT NULL,
    `payment_type_id` INTEGER NOT NULL DEFAULT 0,
    `instrument_type` TEXT NULL,
    `display_order` INTEGER NULL,
    `pfl_status` INTEGER NOT NULL DEFAULT 1,
    `description` TEXT NULL,
    `online_status` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionAppStagesMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `DISPLAY_VALUE` VARCHAR(191) NOT NULL,
    `STAGES_ID` VARCHAR(191) NOT NULL,
    `DISPLAY_ORDER` INTEGER NOT NULL,
    `CURRENT_STATUS` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionFollowUp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` INTEGER NULL,
    `co_id` INTEGER NULL,
    `current_follow_up` TEXT NULL,
    `follow_up_type` TEXT NULL,
    `follow_up_date_time` DATETIME(3) NULL,
    `next_follow_up_date` DATETIME(3) NULL,
    `next_follow_up_remark` TEXT NULL,
    `loan_number` VARCHAR(191) NULL,
    `ptp_mode` TEXT NULL,
    `ptp_amount` TEXT NULL,
    `remarks` TEXT NULL,
    `geo_lat` TEXT NULL,
    `geo_long` TEXT NULL,
    `status` TEXT NULL,
    `next_follow_up_objective` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `display_value` TEXT NULL,
    `follow_up_name` TEXT NULL,
    `generic_key` TEXT NULL,
    `is_image_required` TEXT NULL,
    `is_next_followup_required` TEXT NULL,
    `is_remark_required` TEXT NULL,
    `next_follow_up_status` TEXT NULL,
    `assigned_by` TEXT NULL,
    `telecaller_name` TEXT NULL,

    INDEX `CollectionFollowUp_case_id_loan_number_co_id_idx`(`case_id`, `loan_number`(191), `co_id`),
    INDEX `CollectionFollowUp_co_id_idx`(`co_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionReminders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notification_type` TEXT NULL,
    `employee_id` VARCHAR(191) NULL,
    `case_id` INTEGER NULL,
    `follow_up_id` INTEGER NULL,
    `content` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DepartmentMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_name` TEXT NULL,
    `collection_allowed` BOOLEAN NULL,
    `collection_type` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ENach` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` INTEGER NOT NULL,
    `loan_number` VARCHAR(191) NULL,
    `enach_status` TEXT NULL,
    `emi_amount` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ENach_case_id_idx`(`case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `excotelmaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `excotelcalledid` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FollowUpMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NULL,
    `display_value` TEXT NULL,
    `follow_up_type` TEXT NULL,
    `generic_key` INTEGER NULL,
    `is_remark_required` TEXT NULL,
    `is_image_required` TEXT NULL,
    `is_next_followup_required` TEXT NULL,
    `last_updated_by` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    INDEX `FollowUpMaster_generic_key_idx`(`generic_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GenericMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `generic_key` TEXT NULL,
    `code` TEXT NULL,
    `value` TEXT NULL,
    `display_value` TEXT NULL,
    `is_paid_visit_applicable` TEXT NULL,
    `is_photo_require` TEXT NULL,
    `pfl_status` INTEGER NOT NULL DEFAULT 1,
    `ixl_status` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HourlyLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `co_id` INTEGER NOT NULL,
    `punch_time` TEXT NULL,
    `record_type` TEXT NULL,
    `follow_up_id` INTEGER NULL,
    `attendance_log_id` INTEGER NOT NULL,
    `punch_hour` INTEGER NULL,
    `active` BOOLEAN NULL,
    `geo_lat` TEXT NULL,
    `geo_long` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HourlyLog_co_id_attendance_log_id_idx`(`co_id`, `attendance_log_id`),
    INDEX `HourlyLog_attendance_log_id_idx`(`attendance_log_id`),
    INDEX `HourlyLog_follow_up_id_idx`(`follow_up_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalCaseEvidences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `legal_case_id` INTEGER NULL,
    `loan_number` VARCHAR(191) NULL,
    `document_url` TEXT NULL,
    `document_fetch_url` TEXT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `mime_type` TEXT NULL,
    `evidence_type` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LegalCaseEvidences_legal_case_id_loan_number_evidence_type_idx`(`legal_case_id`, `loan_number`(191), `evidence_type`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalCases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `legal_status_id` INTEGER NULL,
    `case_id` INTEGER NULL,
    `loan_number` VARCHAR(191) NOT NULL,
    `contact` TEXT NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LegalCases_legal_status_id_case_id_loan_number_idx`(`legal_status_id`, `case_id`, `loan_number`),
    INDEX `LegalCases_loan_number_idx`(`loan_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stage_name` TEXT NULL,
    `priority` INTEGER NULL,
    `is_active` BOOLEAN NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalMeterial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_type` TEXT NULL,
    `case_stage` TEXT NULL,
    `document_fetch_url` TEXT NULL,
    `fetch_url` TEXT NULL,
    `mine_type` TEXT NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterRegion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `REGION_NAME` VARCHAR(191) NOT NULL,
    `REGION_VALUE` VARCHAR(191) NOT NULL,
    `DISPLAY_VALUE` VARCHAR(191) NOT NULL,
    `DISPLAY_ORDER` VARCHAR(191) NOT NULL,
    `PFL_STATUS` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MastersScheduler` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `master_name` TEXT NULL,
    `type` TEXT NULL,
    `updated_time` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterZone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ZONE_ID` INTEGER NOT NULL,
    `ZONE_DESC` TEXT NULL,
    `ZONE_DESC_L` TEXT NULL,
    `DISPLAY_VALUE` TEXT NULL,
    `DISPLAY_ORDER` TEXT NULL,
    `REC_STATUS` TEXT NULL,
    `PFL_STATUS` TEXT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,
    `zone_name` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonthMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `month` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentCollect` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` INTEGER NOT NULL,
    `loan_number` VARCHAR(191) NULL,
    `invoice_number` TEXT NULL,
    `bounce_charges` TEXT NULL,
    `order_id` TEXT NULL,
    `gateway_name` TEXT NULL,
    `mobile_number` TEXT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `emi_for_month` TEXT NULL,
    `payment_mode` TEXT NULL,
    `payment_type` TEXT NULL,
    `payment_date` DATETIME(3) NULL,
    `qr_code` TEXT NULL,
    `qr_expiry_time` DATETIME(3) NULL,
    `payment_link` TEXT NULL,
    `merchant_request_number` TEXT NULL,
    `cash_deposit` BOOLEAN NULL,
    `cheque_number` TEXT NULL,
    `collection_done_mobile` TEXT NULL,
    `cash_handling_charges` TEXT NULL,
    `instrument_collected_by` TEXT NULL,
    `bank_acc_number` TEXT NULL,
    `cash_otp` TEXT NULL,
    `cash_mobile_number` TEXT NULL,
    `cash_otp_verified` BOOLEAN NULL,
    `cash_otp_verified_at` DATETIME(3) NULL,
    `geo_lat` TEXT NULL,
    `geo_long` TEXT NULL,
    `gateway_veriy_amount` TEXT NULL,
    `gateway_secure_hash` TEXT NULL,
    `gateway_verify_transaction_id` TEXT NULL,
    `gateway_verify_bank_name` TEXT NULL,
    `gateway_verify_billed_amount` TEXT NULL,
    `gateway_verify_transaction_payment_status` TEXT NULL,
    `gateway_verify_transaction_time` TEXT NULL,
    `gateway_verify_customer_phone` TEXT NULL,
    `expired` BOOLEAN NOT NULL DEFAULT false,
    `is_reciept_generated` BOOLEAN NULL DEFAULT false,
    `receipt_number` TEXT NULL,
    `status` TEXT NULL,
    `month` INTEGER NULL,
    `year` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `additional_gateway_resp` JSON NULL,

    INDEX `PaymentCollect_case_id_loan_number_invoice_number_mobile_num_idx`(`case_id`, `loan_number`(191), `invoice_number`(191), `mobile_number`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentRequestLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endpoint` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `dump` LONGBLOB NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentResponseLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endpoint` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `dump` LONGBLOB NULL,
    `request_log_id` INTEGER NOT NULL,

    INDEX `PaymentResponseLog_request_log_id_idx`(`request_log_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentTransactionOld` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `follow_up_id` INTEGER NOT NULL,
    `transaction_id` TEXT NULL,
    `payment_transaction_id` VARCHAR(191) NOT NULL,
    `pg_response` VARCHAR(191) NOT NULL,
    `branch_id` TEXT NULL,
    `customer_name` VARCHAR(191) NOT NULL,
    `imei` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `tx_status` VARCHAR(191) NOT NULL,
    `transaction_amount` VARCHAR(191) NOT NULL,
    `pg_txn_no` VARCHAR(191) NOT NULL,
    `issuer_ref_no` VARCHAR(191) NOT NULL,
    `auth_id_code` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `pg_resp_code` VARCHAR(191) NOT NULL,
    `address_zip` VARCHAR(191) NOT NULL,
    `status` INTEGER NULL DEFAULT 1,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermissionMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NULL,
    `type` TEXT NULL,
    `status` BOOLEAN NULL,
    `last_updated_by` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermissionMapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type_id` INTEGER NOT NULL,
    `map_type` VARCHAR(191) NOT NULL,
    `permission_id` INTEGER NOT NULL,
    `status` BOOLEAN NULL,
    `last_updated_by` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    INDEX `PermissionMapping_type_id_map_type_permission_id_status_idx`(`type_id`, `map_type`, `permission_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `employee_id` VARCHAR(191) NULL,
    `case_id` INTEGER NULL,
    `loan_number` VARCHAR(191) NULL,
    `reason` TEXT NULL,
    `status` TEXT NULL,
    `remarks` TEXT NULL,
    `new_user_id` INTEGER NULL,
    `new_employee_id` TEXT NULL,
    `allocationMaster` INTEGER NULL,
    `approved_by` TEXT NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReceiptData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `case_id` INTEGER NULL,
    `loan_number` VARCHAR(191) NULL,
    `receipt_type` TEXT NULL,
    `receipt_number` TEXT NULL,
    `receipt_for_the_month` TEXT NULL,
    `fetch_url` TEXT NULL,
    `original_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `last_updated_by` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolesPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `collection_allowed` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolesPermissionState` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER NOT NULL,
    `state_id` INTEGER NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RuleConditions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rule_id` INTEGER NULL,
    `type` TEXT NULL,
    `operator` TEXT NULL,
    `value` TEXT NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loan_number` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `repeat_master_id` INTEGER NULL,
    `message_type_id` INTEGER NULL,
    `follow_up_id` INTEGER NULL,
    `PTP` TEXT NULL,
    `date` TEXT NULL,
    `time` TEXT NULL,
    `is_active` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SearchMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NULL,
    `display_name` TEXT NULL,
    `category` TEXT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Settlement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` INTEGER NOT NULL,
    `application_id` VARCHAR(191) NOT NULL,
    `POS` INTEGER NULL,
    `settlement_type` TEXT NULL,
    `overdue_amount` INTEGER NULL,
    `other_charges` INTEGER NULL,
    `legal_charges` INTEGER NULL,
    `tranche` INTEGER NULL,
    `if_foreclosure` BOOLEAN NULL,
    `status` TEXT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `approver_id` INTEGER NULL,
    `approver_role` TEXT NULL,
    `approved_at` DATETIME(3) NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SMSRequestLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endpoint` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `dump` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SMSResponseLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endpoint` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `dump` JSON NULL,
    `request_log_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaAdditionalAddressMapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` INTEGER NOT NULL,
    `applicant_id` INTEGER NULL,
    `address_line1` VARCHAR(191) NOT NULL,
    `address_line2` TEXT NULL,
    `address_line3` TEXT NULL,
    `landmark` TEXT NULL,
    `state` TEXT NULL,
    `state_code` INTEGER NULL,
    `pincode` TEXT NULL,
    `phone_number_1` TEXT NULL,
    `phone_number_2` TEXT NULL,
    `phone_number_3` TEXT NULL,
    `get_lat` TEXT NULL,
    `geo_long` TEXT NULL,
    `is_active` BOOLEAN NULL,
    `is_deleted` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaAddressDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicant_id` INTEGER NOT NULL,
    `address_line1` VARCHAR(191) NOT NULL,
    `address_line2` TEXT NULL,
    `address_line3` TEXT NULL,
    `landmark` TEXT NULL,
    `city` TEXT NULL,
    `state` TEXT NULL,
    `state_code` INTEGER NULL,
    `pincode` TEXT NULL,
    `geo_lat` TEXT NULL,
    `geo_long` TEXT NULL,
    `is_active` BOOLEAN NULL,
    `is_deleted` BOOLEAN NULL,
    `loan_number` VARCHAR(191) NULL,
    `sequence_number` INTEGER NULL,

    INDEX `SoaAddressDetail_applicant_id_idx`(`applicant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaApplicantDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` INTEGER NOT NULL,
    `is_primary` BOOLEAN NULL,
    `first_name` TEXT NULL,
    `middle_name` TEXT NULL,
    `sequence_number` INTEGER NULL,
    `last_name` TEXT NULL,
    `mobile_number` VARCHAR(191) NOT NULL,
    `alternate_number` TEXT NULL,
    `email` TEXT NULL,
    `additional_email` TEXT NULL,
    `is_guarantor` BOOLEAN NULL,
    `adhaar_number` TEXT NULL,
    `salesforce_ref_id` TEXT NULL,
    `loan_number` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaApplicantHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicant_id` INTEGER NOT NULL,
    `case_id` INTEGER NOT NULL,
    `table_name` VARCHAR(191) NOT NULL,
    `data_changed` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `history_detail` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaBankingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicant_id` INTEGER NOT NULL,
    `case_id` INTEGER NOT NULL,
    `branch` VARCHAR(191) NOT NULL,
    `account_number` TEXT NULL,
    `ifsc_code` TEXT NULL,
    `registered_phone_number` TEXT NULL,
    `loan_number` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NULL,
    `is_primary` BOOLEAN NULL,
    `auto_debit` BOOLEAN NULL,

    INDEX `SoaBankingDetails_case_id_idx`(`case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaCaseMapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loan_number` VARCHAR(191) NOT NULL,
    `loan_tenure` TEXT NULL,
    `application_id` TEXT NULL,
    `opportunity_id` TEXT NULL,
    `disbursed_amount` TEXT NULL,
    `co_id` INTEGER NULL,
    `bcm_id` INTEGER NULL,
    `assigned_user` TEXT NULL,
    `loan_purpose` TEXT NULL,
    `loan_principal_balance` INTEGER NULL,
    `principal_outstanding` INTEGER NULL,
    `bureau_balances_current` TEXT NULL,
    `bureau_balances_overdue` TEXT NULL,
    `bucket` VARCHAR(191) NULL,
    `dpd_opening` TEXT NULL,
    `bureau_accounts_total` TEXT NULL,
    `bureau_accounts_overdue` TEXT NULL,
    `bureau_accounts_zero_balance` TEXT NULL,
    `bureau_date_opened_recent` TEXT NULL,
    `bureau_date_opened_oldest` TEXT NULL,
    `bureau_active_acc` TEXT NULL,
    `bureau_new_delinquent_acc` TEXT NULL,
    `bureau_account_status` TEXT NULL,
    `bureau_name` TEXT NULL,
    `bureau_mobile` TEXT NULL,
    `bureau_address` TEXT NULL,
    `geo_tag_link` TEXT NULL,
    `incentive` INTEGER NULL,
    `case_type` TEXT NULL,
    `loan_branch_id` INTEGER NULL,
    `branch_id` INTEGER NULL,
    `approved_by` INTEGER NULL,
    `branch` TEXT NULL,
    `legal_status` TEXT NULL,
    `legal_stage` TEXT NULL,
    `loan_approval_date` TEXT NULL,
    `disbursal_status` TEXT NULL,
    `rate_of_interest` TEXT NULL,
    `sanctioned_amount` INTEGER NULL,
    `date_from` DATETIME(3) NULL,
    `date_to` DATETIME(3) NULL,
    `status` INTEGER NULL,
    `created_at` DATETIME(3) NULL,
    `udpated_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `account_type` TEXT NULL,
    `active_acc` TEXT NULL,
    `total_dues` TEXT NULL,
    `new_delinquent_acc` TEXT NULL,
    `balance_collectible` TEXT NULL,

    UNIQUE INDEX `SoaCaseMapping_loan_number_key`(`loan_number`),
    INDEX `SoaCaseMapping_co_id_idx`(`co_id`),
    INDEX `SoaCaseMapping_co_id_bucket_status_idx`(`co_id`, `bucket`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaEmiMapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` INTEGER NOT NULL,
    `loan_number` VARCHAR(191) NOT NULL,
    `application_id` TEXT NULL,
    `visit_charges` TEXT NULL,
    `emi_for_month` TEXT NULL,
    `foreclosure_charges` TEXT NULL,
    `due_for_month` TEXT NULL,
    `odi_charges` TEXT NULL,
    `total_dues_ftm` TEXT NULL,
    `charges_for_month` TEXT NULL,
    `bounce_charges` TEXT NULL,
    `arrear_emi` TEXT NULL,
    `arrear_bounce_emi` TEXT NULL,
    `future_emi` TEXT NULL,
    `total_payment` TEXT NULL,
    `original_due` TEXT NULL,
    `legal_charges` TEXT NULL,
    `call_charges` TEXT NULL,
    `payment_date` DATETIME(3) NULL,
    `selected_payment_method` TEXT NULL,
    `legal_case_id` INTEGER NULL,
    `emi_pending_no` TEXT NULL,
    `emi_pemi_dues` TEXT NULL,
    `rate_of_interest` TEXT NULL,
    `conveyance_charges` TEXT NULL,
    `total_updated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cash_handling_charges` TEXT NULL,
    `lpp_charges` TEXT NULL,
    `total_dues` TEXT NULL,
    `charges_payable` TEXT NULL,
    `cbc_charges` TEXT NULL,
    `emi_paid` TEXT NULL,
    `anchor_rate` TEXT NULL,
    `bounce_reason` TEXT NULL,
    `balances_current` TEXT NULL,
    `balances_overdue` TEXT NULL,

    INDEX `SoaEmiMapping_loan_number_case_id_idx`(`loan_number`, `case_id`),
    INDEX `SoaEmiMapping_case_id_idx`(`case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaEmiMappingHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `emi_details_id` INTEGER NULL,
    `update_for_month` TEXT NULL,
    `update_for_year` TEXT NULL,
    `update` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaPropertyDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` INTEGER NOT NULL,
    `property_value` TEXT NULL,
    `property_address` TEXT NULL,
    `property_pincode` TEXT NULL,
    `state` TEXT NULL,
    `city` TEXT NULL,
    `state_code` INTEGER NULL,
    `loan_number` VARCHAR(191) NULL,

    INDEX `SoaPropertyDetail_case_id_loan_number_idx`(`case_id`, `loan_number`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoaReferenceDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_id` INTEGER NOT NULL,
    `reference_1_type` TEXT NULL,
    `reference_1_full_name` TEXT NULL,
    `loan_number` VARCHAR(191) NOT NULL,
    `reference_1_phone_number` TEXT NULL,
    `reference_1_address` TEXT NULL,
    `reference_1_pincode` TEXT NULL,
    `reference_1_city` TEXT NULL,
    `reference_1_state` TEXT NULL,
    `reference_1_email` TEXT NULL,
    `reference_2_type` TEXT NULL,
    `reference_2_full_name` TEXT NULL,
    `reference_2_phone_number` TEXT NULL,
    `reference_2_address` TEXT NULL,
    `reference_2_pincode` TEXT NULL,
    `reference_2_city` TEXT NULL,
    `reference_2_state` TEXT NULL,
    `reference_2_email` TEXT NULL,
    `extra_params` JSON NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SoaReferenceDetail_case_id_loan_number_idx`(`case_id`, `loan_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StateMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `country_id` INTEGER NOT NULL,
    `state_id` INTEGER NULL,
    `state_desc` TEXT NULL,
    `display_value` TEXT NULL,
    `display_order` INTEGER NULL,
    `omnifin_status` INTEGER NULL,
    `current_status` INTEGER NULL,
    `pmay_state_id` INTEGER NULL,
    `retirement_age_gov` INTEGER NULL,
    `retirement_age_pvt` INTEGER NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SyncHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sync_date` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sync_count` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email_id` TEXT NULL,
    `primary_email` TEXT NULL,
    `employee_id` VARCHAR(191) NOT NULL,
    `department_id` INTEGER NULL,
    `username` TEXT NOT NULL,
    `branch_id` INTEGER NULL,
    `password` TEXT NULL,
    `otp` TEXT NULL,
    `temp_token` TEXT NULL,
    `mobile_number` TEXT NULL,
    `IMEI_latest` TEXT NULL,
    `IMEI_previous` TEXT NULL,
    `device_id` TEXT NULL,
    `device_id_previous` TEXT NULL,
    `network_type` TEXT NULL,
    `battery_life` TEXT NULL,
    `brand_name` TEXT NULL,
    `model_name` TEXT NULL,
    `os_version` TEXT NULL,
    `network_source` TEXT NULL,
    `file_tracing_user_type` INTEGER NULL,
    `vendor_id` INTEGER NULL,
    `vendor_pdc` INTEGER NULL,
    `role_id` INTEGER NULL,
    `role_master_id` INTEGER NULL,
    `all_branch` INTEGER NULL DEFAULT 0,
    `team_leader_id` INTEGER NULL,
    `invalid_credential_count` INTEGER NULL DEFAULT 0,
    `invalid_credential_time` DATETIME(3) NULL,
    `user_type` INTEGER NULL DEFAULT 0,
    `online_status` INTEGER NULL DEFAULT 1,
    `online_payment` INTEGER NOT NULL DEFAULT 1,
    `first_login_time` DATETIME(3) NULL,
    `last_login_time` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL,
    `shift_start_time` TEXT NULL,
    `shift_end_time` TEXT NULL,
    `geo_lat` TEXT NULL,
    `geo_long` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_employee_id_key`(`employee_id`),
    INDEX `User_username_mobile_number_email_id_idx`(`username`(191), `mobile_number`(191), `email_id`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAttendanceLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `co_id` INTEGER NOT NULL,
    `start_time` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `end_time` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `log_type` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `geo_lat` TEXT NULL,
    `geo_long` TEXT NULL,
    `active` BOOLEAN NULL,

    INDEX `UserAttendanceLog_co_id_idx`(`co_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `change_history` JSON NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `UserHistory_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserMapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_code` VARCHAR(191) NULL,
    `manager_code` TEXT NULL,
    `map_type` TEXT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,
    `changed_by` INTEGER NULL,

    INDEX `UserMapping_employee_code_map_type_manager_code_idx`(`employee_code`(191), `map_type`(191), `manager_code`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRoles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `user_code` TEXT NULL,
    `role_id` INTEGER NULL,
    `type` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NULL,
    `display_order` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    INDEX `UserRoles_user_id_idx`(`user_id`),
    INDEX `UserRoles_role_id_idx`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `imei` TEXT NULL,
    `device_id` TEXT NULL,
    `user_agent` TEXT NULL,
    `logged_in_at` DATETIME(3) NULL,
    `logged_out_at` DATETIME(3) NULL,
    `active` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `expires_at` DATETIME(3) NULL,

    UNIQUE INDEX `UserSessions_token_key`(`token`),
    INDEX `UserSessions_user_id_token_created_at_idx`(`user_id`, `token`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VendorMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendor_code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `contact_person_it` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `telephone_no` VARCHAR(191) NOT NULL,
    `mobile_no` VARCHAR(191) NOT NULL,
    `fax_no` VARCHAR(191) NOT NULL,
    `email_id` VARCHAR(191) NOT NULL,
    `contact_person_ac` VARCHAR(191) NOT NULL,
    `telephone_no_ac` VARCHAR(191) NOT NULL,
    `items` VARCHAR(191) NOT NULL,
    `nature_of_business` VARCHAR(191) NOT NULL,
    `commencement_date` VARCHAR(191) NOT NULL,
    `pan_no` VARCHAR(191) NOT NULL,
    `tin_no` VARCHAR(191) NOT NULL,
    `service_tax_reg_no` VARCHAR(191) NOT NULL,
    `category_service_no` VARCHAR(191) NOT NULL,
    `vat_no` VARCHAR(191) NOT NULL,
    `cst_no` VARCHAR(191) NOT NULL,
    `tan_no` VARCHAR(191) NOT NULL,
    `gst_no` VARCHAR(191) NOT NULL,
    `account_name` VARCHAR(191) NOT NULL,
    `account_number` VARCHAR(191) NOT NULL,
    `pay_to_name` VARCHAR(191) NOT NULL,
    `account_type` VARCHAR(191) NOT NULL,
    `bank_name` VARCHAR(191) NOT NULL,
    `branch_name` VARCHAR(191) NOT NULL,
    `bank_address` VARCHAR(191) NOT NULL,
    `bank_rtgs` VARCHAR(191) NOT NULL,
    `bank_isfc` VARCHAR(191) NOT NULL,
    `bank_micr` VARCHAR(191) NOT NULL,
    `bank_swift` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `versionmaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `application` TEXT NULL,
    `platform` TEXT NULL,
    `current_version_update` TEXT NULL,
    `updated_app_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Allocation` ADD CONSTRAINT `Allocation_master_id_fkey` FOREIGN KEY (`master_id`) REFERENCES `AllocationMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Allocation` ADD CONSTRAINT `Allocation_co_code_fkey` FOREIGN KEY (`co_code`) REFERENCES `User`(`employee_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankBranchMaster` ADD CONSTRAINT `BankBranchMaster_BANK_ID_fkey` FOREIGN KEY (`BANK_ID`) REFERENCES `bankmaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankBranchMaster` ADD CONSTRAINT `BankBranchMaster_REGION_ID_fkey` FOREIGN KEY (`REGION_ID`) REFERENCES `MasterRegion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchMaster` ADD CONSTRAINT `BranchMaster_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `MasterRegion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchMaster` ADD CONSTRAINT `BranchMaster_zone_id_fkey` FOREIGN KEY (`zone_id`) REFERENCES `MasterZone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CallDuration` ADD CONSTRAINT `CallDuration_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CashDeposite` ADD CONSTRAINT `CashDeposite_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChequeBounce` ADD CONSTRAINT `ChequeBounce_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollectionFollowUp` ADD CONSTRAINT `CollectionFollowUp_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollectionFollowUp` ADD CONSTRAINT `CollectionFollowUp_co_id_fkey` FOREIGN KEY (`co_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollectionReminders` ADD CONSTRAINT `CollectionReminders_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `User`(`employee_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ENach` ADD CONSTRAINT `ENach_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowUpMaster` ADD CONSTRAINT `FollowUpMaster_generic_key_fkey` FOREIGN KEY (`generic_key`) REFERENCES `GenericMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HourlyLog` ADD CONSTRAINT `HourlyLog_co_id_fkey` FOREIGN KEY (`co_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HourlyLog` ADD CONSTRAINT `HourlyLog_attendance_log_id_fkey` FOREIGN KEY (`attendance_log_id`) REFERENCES `UserAttendanceLog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HourlyLog` ADD CONSTRAINT `HourlyLog_follow_up_id_fkey` FOREIGN KEY (`follow_up_id`) REFERENCES `CollectionFollowUp`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LegalCaseEvidences` ADD CONSTRAINT `LegalCaseEvidences_legal_case_id_fkey` FOREIGN KEY (`legal_case_id`) REFERENCES `LegalCases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LegalCaseEvidences` ADD CONSTRAINT `LegalCaseEvidences_loan_number_fkey` FOREIGN KEY (`loan_number`) REFERENCES `SoaCaseMapping`(`loan_number`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LegalCases` ADD CONSTRAINT `LegalCases_legal_status_id_fkey` FOREIGN KEY (`legal_status_id`) REFERENCES `LegalMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LegalCases` ADD CONSTRAINT `LegalCases_loan_number_fkey` FOREIGN KEY (`loan_number`) REFERENCES `SoaCaseMapping`(`loan_number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentCollect` ADD CONSTRAINT `PaymentCollect_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentResponseLog` ADD CONSTRAINT `PaymentResponseLog_request_log_id_fkey` FOREIGN KEY (`request_log_id`) REFERENCES `PaymentRequestLog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionMapping` ADD CONSTRAINT `PermissionMapping_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `PermissionMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReAssignment` ADD CONSTRAINT `ReAssignment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReAssignment` ADD CONSTRAINT `ReAssignment_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReceiptData` ADD CONSTRAINT `ReceiptData_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReceiptData` ADD CONSTRAINT `ReceiptData_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RuleConditions` ADD CONSTRAINT `RuleConditions_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `AllocationRules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_loan_number_fkey` FOREIGN KEY (`loan_number`) REFERENCES `SoaCaseMapping`(`loan_number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_follow_up_id_fkey` FOREIGN KEY (`follow_up_id`) REFERENCES `CollectionFollowUp`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Settlement` ADD CONSTRAINT `Settlement_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SMSResponseLog` ADD CONSTRAINT `SMSResponseLog_request_log_id_fkey` FOREIGN KEY (`request_log_id`) REFERENCES `SMSRequestLog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaAdditionalAddressMapping` ADD CONSTRAINT `SoaAdditionalAddressMapping_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaAddressDetail` ADD CONSTRAINT `SoaAddressDetail_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `SoaApplicantDetail`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaApplicantDetail` ADD CONSTRAINT `SoaApplicantDetail_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaApplicantHistory` ADD CONSTRAINT `SoaApplicantHistory_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `SoaApplicantDetail`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaBankingDetails` ADD CONSTRAINT `SoaBankingDetails_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `SoaApplicantDetail`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaBankingDetails` ADD CONSTRAINT `SoaBankingDetails_loan_number_fkey` FOREIGN KEY (`loan_number`) REFERENCES `SoaCaseMapping`(`loan_number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaCaseMapping` ADD CONSTRAINT `SoaCaseMapping_co_id_fkey` FOREIGN KEY (`co_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaEmiMapping` ADD CONSTRAINT `SoaEmiMapping_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaEmiMappingHistory` ADD CONSTRAINT `SoaEmiMappingHistory_emi_details_id_fkey` FOREIGN KEY (`emi_details_id`) REFERENCES `SoaEmiMapping`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaPropertyDetail` ADD CONSTRAINT `SoaPropertyDetail_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoaReferenceDetail` ADD CONSTRAINT `SoaReferenceDetail_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `SoaCaseMapping`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `BranchMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `DepartmentMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAttendanceLog` ADD CONSTRAINT `UserAttendanceLog_co_id_fkey` FOREIGN KEY (`co_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserHistory` ADD CONSTRAINT `UserHistory_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMapping` ADD CONSTRAINT `UserMapping_employee_code_fkey` FOREIGN KEY (`employee_code`) REFERENCES `User`(`employee_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoles` ADD CONSTRAINT `UserRoles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoles` ADD CONSTRAINT `UserRoles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `RoleMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSessions` ADD CONSTRAINT `UserSessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
