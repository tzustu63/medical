import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SystemParameter } from './entities/system-parameter.entity';
import { Hospital } from '@/modules/hospitals/entities/hospital.entity';

export interface Region {
  county: string;
  townships: string[];
}

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(SystemParameter)
    private parameterRepository: Repository<SystemParameter>,
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
  ) {}

  async getRegions(): Promise<{ success: boolean; data: Region[] }> {
    // 台灣偏鄉地區列表
    const regions: Region[] = [
      {
        county: '屏東縣',
        townships: [
          '屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉',
          '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉',
          '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉',
          '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉',
          '枋山鄉', '三地門鄉', '霧台鄉', '瑪家鄉', '泰武鄉', '來義鄉',
          '春日鄉', '獅子鄉', '牡丹鄉',
        ],
      },
      {
        county: '台東縣',
        townships: [
          '台東市', '成功鎮', '關山鎮', '卑南鄉', '鹿野鄉', '池上鄉',
          '東河鄉', '長濱鄉', '太麻里鄉', '大武鄉', '綠島鄉', '蘭嶼鄉',
          '延平鄉', '海端鄉', '達仁鄉', '金峰鄉',
        ],
      },
      {
        county: '花蓮縣',
        townships: [
          '花蓮市', '鳳林鎮', '玉里鎮', '新城鄉', '吉安鄉', '壽豐鄉',
          '光復鄉', '豐濱鄉', '瑞穗鄉', '富里鄉', '秀林鄉', '萬榮鄉',
          '卓溪鄉',
        ],
      },
      {
        county: '澎湖縣',
        townships: [
          '馬公市', '湖西鄉', '白沙鄉', '西嶼鄉', '望安鄉', '七美鄉',
        ],
      },
      {
        county: '金門縣',
        townships: ['金城鎮', '金湖鎮', '金沙鎮', '金寧鄉', '烈嶼鄉', '烏坵鄉'],
      },
      {
        county: '連江縣',
        townships: ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉'],
      },
    ];

    return { success: true, data: regions };
  }

  async getSpecialties(professionalType?: string) {
    // 醫師專科
    const doctorSpecialties = [
      { id: 'internal_medicine', name: '內科', category: '醫師' },
      { id: 'surgery', name: '外科', category: '醫師' },
      { id: 'pediatrics', name: '小兒科', category: '醫師' },
      { id: 'obstetrics_gynecology', name: '婦產科', category: '醫師' },
      { id: 'family_medicine', name: '家醫科', category: '醫師' },
      { id: 'emergency', name: '急診醫學科', category: '醫師' },
      { id: 'orthopedics', name: '骨科', category: '醫師' },
      { id: 'dermatology', name: '皮膚科', category: '醫師' },
      { id: 'ophthalmology', name: '眼科', category: '醫師' },
      { id: 'ent', name: '耳鼻喉科', category: '醫師' },
      { id: 'psychiatry', name: '精神科', category: '醫師' },
      { id: 'neurology', name: '神經內科', category: '醫師' },
      { id: 'cardiology', name: '心臟內科', category: '醫師' },
      { id: 'gastroenterology', name: '腸胃內科', category: '醫師' },
      { id: 'rehabilitation', name: '復健科', category: '醫師' },
      { id: 'radiology', name: '放射科', category: '醫師' },
      { id: 'anesthesiology', name: '麻醉科', category: '醫師' },
    ];

    // 護理專科
    const nurseSpecialties = [
      { id: 'medical_nursing', name: '內科護理', category: '護理' },
      { id: 'surgical_nursing', name: '外科護理', category: '護理' },
      { id: 'pediatric_nursing', name: '兒科護理', category: '護理' },
      { id: 'obstetric_nursing', name: '產科護理', category: '護理' },
      { id: 'emergency_nursing', name: '急診護理', category: '護理' },
      { id: 'icu_nursing', name: '加護病房護理', category: '護理' },
    ];

    let data = [...doctorSpecialties, ...nurseSpecialties];

    if (professionalType === 'doctor') {
      data = doctorSpecialties;
    } else if (professionalType === 'nurse' || professionalType === 'registered_nurse') {
      data = nurseSpecialties;
    }

    return { success: true, data };
  }

  async getHospitals(county?: string, township?: string, search?: string) {
    const queryBuilder = this.hospitalRepository
      .createQueryBuilder('hospital')
      .where('hospital.isActive = true');

    if (county) {
      queryBuilder.andWhere('hospital.county = :county', { county });
    }

    if (township) {
      queryBuilder.andWhere('hospital.township = :township', { township });
    }

    if (search) {
      queryBuilder.andWhere('hospital.name ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder.orderBy('hospital.name', 'ASC');

    const hospitals = await queryBuilder.getMany();

    return {
      success: true,
      data: hospitals.map((h) => ({
        hospitalId: h.hospitalCode,
        name: h.name,
        county: h.county,
        township: h.township,
        address: h.address,
        phone: h.phone,
        type: h.hospitalType,
      })),
    };
  }
}

