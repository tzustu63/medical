-- 啟用擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 建立枚舉類型
CREATE TYPE user_type AS ENUM ('healthcare_professional', 'hospital_admin', 'system_admin');
CREATE TYPE professional_type AS ENUM ('doctor', 'nurse', 'registered_nurse', 'pharmacist', 'pharmacy_technician', 'medical_technologist', 'medical_laboratory_technician');
CREATE TYPE hospital_type AS ENUM ('medical_center', 'regional_hospital', 'district_hospital', 'clinic');
CREATE TYPE job_type AS ENUM ('support', 'permanent');
CREATE TYPE service_type AS ENUM ('outpatient', 'inpatient', 'emergency', 'other');
CREATE TYPE job_status AS ENUM ('draft', 'open', 'closed', 'filled', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected', 'cancelled', 'withdrawn');

-- 插入測試醫院資料
INSERT INTO hospitals (id, hospital_code, name, county, township, address, phone, hospital_type, is_active)
VALUES 
  (uuid_generate_v4(), 'HOSP001', '寶建醫療社團法人寶建醫院', '屏東縣', '屏東市', '屏東縣屏東市中正路123號', '08-7665995', 'regional_hospital', true),
  (uuid_generate_v4(), 'HOSP002', '台東基督教醫院', '台東縣', '台東市', '台東縣台東市開封街456號', '089-310150', 'district_hospital', true),
  (uuid_generate_v4(), 'HOSP003', '花蓮慈濟醫院', '花蓮縣', '花蓮市', '花蓮縣花蓮市中央路三段707號', '03-8561825', 'medical_center', true),
  (uuid_generate_v4(), 'HOSP004', '澎湖惠民醫院', '澎湖縣', '馬公市', '澎湖縣馬公市中正路10號', '06-9272131', 'district_hospital', true),
  (uuid_generate_v4(), 'HOSP005', '來義鄉衛生所', '屏東縣', '來義鄉', '屏東縣來義鄉南和村南和路55號', '08-7850121', 'clinic', true),
  (uuid_generate_v4(), 'HOSP006', '蘭嶼鄉衛生所', '台東縣', '蘭嶼鄉', '台東縣蘭嶼鄉紅頭村1號', '089-731531', 'clinic', true);

