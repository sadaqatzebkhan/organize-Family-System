import { FamilyDatabase, FamilyBranch, Person, Relationship } from '../types';

export const initialBranches: FamilyBranch[] = [
  { id: 'branch_root', name: 'Mazid Khail', description: 'Ancestral Lineage of Mazid Khail' },
  { id: 'branch_door', name: 'Door Muhammad Khan Branch', parentBranchId: 'branch_root', patriarchPersonId: 'p_door' },
  { id: 'branch_noor', name: 'Noor Muhammad Shah Branch', parentBranchId: 'branch_root', patriarchPersonId: 'p_noor' },
  { id: 'branch_yar', name: 'Yar Muhammad Shah Branch', parentBranchId: 'branch_root', patriarchPersonId: 'p_yar' },
  { id: 'branch_gujar', name: 'Gujar Khan Sub-Branch', parentBranchId: 'branch_door', patriarchPersonId: 'p_gujar' },
  { id: 'branch_saho', name: 'Saho Khan Sub-Branch', parentBranchId: 'branch_door', patriarchPersonId: 'p_saho' },
  { id: 'branch_zarfaraz', name: 'Zarfaraz Khan Sub-Branch', parentBranchId: 'branch_gujar', patriarchPersonId: 'p_zarfaraz' },
  { id: 'branch_lal_faraz', name: 'Lal Faraz Khan Sub-Branch', parentBranchId: 'branch_gujar', patriarchPersonId: 'p_lal_faraz' },
  { id: 'branch_anwar_faraz', name: 'Anwar Faraz Khan Sub-Branch', parentBranchId: 'branch_gujar', patriarchPersonId: 'p_anwar_faraz' },
  { id: 'branch_nawaz', name: 'Muhammad Nawaz Khan Sub-Branch', parentBranchId: 'branch_gujar', patriarchPersonId: 'p_m_nawaz' },
];

const now = new Date().toISOString();

export const initialPeople: Person[] = [
  // --- Generation 1 ---
  {
    id: 'p_door',
    fullName: 'Door Muhammad Khan',
    generation: 1,
    branchId: 'branch_door',
    branchName: 'Door Muhammad Khan Branch',
    aliveStatus: 'deceased',
    biography: 'One of the three founding patriarch brothers of the Mazid Khail family.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_noor',
    fullName: 'Noor Muhammad Shah',
    generation: 1,
    branchId: 'branch_noor',
    branchName: 'Noor Muhammad Shah Branch',
    aliveStatus: 'deceased',
    biography: 'One of the three founding patriarch brothers of the Mazid Khail family.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_yar',
    fullName: 'Yar Muhammad Shah',
    generation: 1,
    branchId: 'branch_yar',
    branchName: 'Yar Muhammad Shah Branch',
    aliveStatus: 'deceased',
    biography: 'One of the three founding patriarch brothers of the Mazid Khail family.',
    createdAt: now,
    updatedAt: now,
  },

  // --- Generation 2 ---
  // Door Muhammad Khan's Sons
  {
    id: 'p_gujar',
    fullName: 'Gujar Khan',
    fatherId: 'p_door',
    generation: 2,
    branchId: 'branch_gujar',
    branchName: 'Gujar Khan Sub-Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_saho',
    fullName: 'Saho Khan',
    fatherId: 'p_door',
    generation: 2,
    branchId: 'branch_saho',
    branchName: 'Saho Khan Sub-Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  // Noor Muhammad Shah's Sons
  {
    id: 'p_zareen',
    fullName: 'Zareen',
    fatherId: 'p_noor',
    generation: 2,
    branchId: 'branch_noor',
    branchName: 'Noor Muhammad Shah Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_fazal_shah',
    fullName: 'Fazal Shah',
    fatherId: 'p_noor',
    generation: 2,
    branchId: 'branch_noor',
    branchName: 'Noor Muhammad Shah Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  // Yar Muhammad Shah's Sons
  {
    id: 'p_gul_m_shah',
    fullName: 'Gul M. Shah',
    fatherId: 'p_yar',
    generation: 2,
    branchId: 'branch_yar',
    branchName: 'Yar Muhammad Shah Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_m_arif_khan',
    fullName: 'M. Arif Khan',
    fatherId: 'p_yar',
    generation: 2,
    branchId: 'branch_yar',
    branchName: 'Yar Muhammad Shah Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_noor_m_shah',
    fullName: 'Noor M. Shah',
    fatherId: 'p_yar',
    generation: 2,
    branchId: 'branch_yar',
    branchName: 'Yar Muhammad Shah Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_saeed_arif',
    fullName: 'Saeed Arif',
    fatherId: 'p_yar',
    generation: 2,
    branchId: 'branch_yar',
    branchName: 'Yar Muhammad Shah Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },

  // --- Generation 3 (Sons of Gujar Khan) ---
  {
    id: 'p_gul_m_jan',
    fullName: 'Gul Muhammad Jan',
    fatherId: 'p_gujar',
    generation: 3,
    branchId: 'branch_gujar',
    branchName: 'Gujar Khan Sub-Branch',
    aliveStatus: 'deceased',
    notes: 'Photo preserved in original family record document.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_khan_faqeer',
    fullName: 'Khan Faqeer',
    fatherId: 'p_gujar',
    generation: 3,
    branchId: 'branch_gujar',
    branchName: 'Gujar Khan Sub-Branch',
    aliveStatus: 'deceased',
    notes: 'Also recorded as K-Faqeer.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_zarfaraz',
    fullName: 'Zarfaraz Khan',
    fatherId: 'p_gujar',
    generation: 3,
    branchId: 'branch_zarfaraz',
    branchName: 'Zarfaraz Khan Sub-Branch',
    deathDate: '2003-05-11',
    aliveStatus: 'deceased',
    notes: 'Death Date recorded as 11-05-2003 in family archives. Photo preserved.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_lal_faraz',
    fullName: 'Lal Faraz Khan',
    fatherId: 'p_gujar',
    generation: 3,
    branchId: 'branch_lal_faraz',
    branchName: 'Lal Faraz Khan Sub-Branch',
    aliveStatus: 'deceased',
    notes: 'Recorded as Lal faraz.K in family archives. Photo preserved.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_anwar_faraz',
    fullName: 'Anwar Faraz Khan',
    fatherId: 'p_gujar',
    generation: 3,
    branchId: 'branch_anwar_faraz',
    branchName: 'Anwar Faraz Khan Sub-Branch',
    deathDate: '2013-12-31',
    aliveStatus: 'deceased',
    notes: 'Death Date recorded as 31-12-2013 in family archives. Photo preserved.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_m_nawaz',
    fullName: 'Muhammad Nawaz Khan',
    fatherId: 'p_gujar',
    generation: 3,
    branchId: 'branch_nawaz',
    branchName: 'Muhammad Nawaz Khan Sub-Branch',
    birthDate: '1947',
    aliveStatus: 'alive',
    notes: 'Recorded in archives: Birth 1947, Status: Alive. Photo preserved.',
    createdAt: now,
    updatedAt: now,
  },

  // --- Generation 4 ---
  // Sons of Gul Muhammad Jan
  {
    id: 'p_m_darviz',
    fullName: 'Muhammad Darviz Khan',
    fatherId: 'p_gul_m_jan',
    generation: 4,
    branchId: 'branch_gujar',
    branchName: 'Gujar Khan Sub-Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_abdul_manan',
    fullName: 'Abdul Manan',
    fatherId: 'p_gul_m_jan',
    generation: 4,
    branchId: 'branch_gujar',
    branchName: 'Gujar Khan Sub-Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_talib_jan',
    fullName: 'Talib Jan',
    fatherId: 'p_gul_m_jan',
    generation: 4,
    branchId: 'branch_gujar',
    branchName: 'Gujar Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },

  // Sons of Zarfaraz Khan
  {
    id: 'p_sultan_khan',
    fullName: 'Sultan Khan',
    fatherId: 'p_zarfaraz',
    generation: 4,
    branchId: 'branch_zarfaraz',
    branchName: 'Zarfaraz Khan Sub-Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_m_alam_khan',
    fullName: 'Muhammad Alam Khan',
    fatherId: 'p_zarfaraz',
    generation: 4,
    branchId: 'branch_zarfaraz',
    branchName: 'Zarfaraz Khan Sub-Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_saeed_bacha',
    fullName: 'Saeed Bacha',
    fatherId: 'p_zarfaraz',
    generation: 4,
    branchId: 'branch_zarfaraz',
    branchName: 'Zarfaraz Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_gul_bacha',
    fullName: 'Gul Bacha',
    fatherId: 'p_zarfaraz',
    generation: 4,
    branchId: 'branch_zarfaraz',
    branchName: 'Zarfaraz Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },

  // Sons of Lal Faraz Khan
  {
    id: 'p_zarawar_khan',
    fullName: 'Zarawar Khan',
    fatherId: 'p_lal_faraz',
    generation: 4,
    branchId: 'branch_lal_faraz',
    branchName: 'Lal Faraz Khan Sub-Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_sultan_bacha',
    fullName: 'Sultan Bacha',
    fatherId: 'p_lal_faraz',
    generation: 4,
    branchId: 'branch_lal_faraz',
    branchName: 'Lal Faraz Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },

  // Sons of Anwar Faraz Khan
  {
    id: 'p_mehtab_khan',
    fullName: 'Mehtab Khan',
    fatherId: 'p_anwar_faraz',
    generation: 4,
    branchId: 'branch_anwar_faraz',
    branchName: 'Anwar Faraz Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_nawshad_khan',
    fullName: 'Nawshad Khan',
    fatherId: 'p_anwar_faraz',
    generation: 4,
    branchId: 'branch_anwar_faraz',
    branchName: 'Anwar Faraz Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_walayat_khan',
    fullName: 'Walayat Khan',
    fatherId: 'p_anwar_faraz',
    generation: 4,
    branchId: 'branch_anwar_faraz',
    branchName: 'Anwar Faraz Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_ihsan_ullah',
    fullName: 'Ihsan Ullah',
    fatherId: 'p_anwar_faraz',
    generation: 4,
    branchId: 'branch_anwar_faraz',
    branchName: 'Anwar Faraz Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_rahman_ullah',
    fullName: 'Rahman Ullah',
    fatherId: 'p_anwar_faraz',
    generation: 4,
    branchId: 'branch_anwar_faraz',
    branchName: 'Anwar Faraz Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },

  // Sons of Muhammad Nawaz Khan
  {
    id: 'p_akbar_zada',
    fullName: 'Akbar Zada',
    fatherId: 'p_m_nawaz',
    generation: 4,
    branchId: 'branch_nawaz',
    branchName: 'Muhammad Nawaz Khan Sub-Branch',
    aliveStatus: 'deceased',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p_amir_zada',
    fullName: 'Amir Zada',
    fatherId: 'p_m_nawaz',
    generation: 4,
    branchId: 'branch_nawaz',
    branchName: 'Muhammad Nawaz Khan Sub-Branch',
    aliveStatus: 'alive',
    createdAt: now,
    updatedAt: now,
  },

  // --- Generation 5 ---
  // Sons of Muhammad Darviz Khan
  { id: 'p_abid_ullah', fullName: 'Abid Ullah', fatherId: 'p_m_darviz', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_saeed_ullah', fullName: 'Saeed Ullah', fatherId: 'p_m_darviz', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_ibrahim_khan', fullName: 'Ibrahim Khan', fatherId: 'p_m_darviz', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Abdul Manan
  { id: 'p_abid_urahman', fullName: 'Abid Urahman', fatherId: 'p_abdul_manan', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_saeed_urahman', fullName: 'Saeed Urahman', fatherId: 'p_abdul_manan', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_najeeb_khan', fullName: 'Najeeb Khan', fatherId: 'p_abdul_manan', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_attaurahman', fullName: 'Attaurahman', fatherId: 'p_abdul_manan', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Talib Jan
  { id: 'p_bilal', fullName: 'Bilal', fatherId: 'p_talib_jan', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_muzamil', fullName: 'Muzamil', fatherId: 'p_talib_jan', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_rehan', fullName: 'Rehan', fatherId: 'p_talib_jan', generation: 5, branchId: 'branch_gujar', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Sultan Khan (Zarfaraz line)
  { id: 'p_bacha_nat_khan', fullName: 'Bacha Nat Khan', fatherId: 'p_sultan_khan', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_hasham_khan', fullName: 'Hasham Khan', fatherId: 'p_sultan_khan', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_sultan_muhammad', fullName: 'Sultan Muhammad', fatherId: 'p_sultan_khan', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Muhammad Alam Khan
  { id: 'p_ajab_khan', fullName: 'Ajab Khan', fatherId: 'p_m_alam_khan', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_adam_khan', fullName: 'Adam Khan', fatherId: 'p_m_alam_khan', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Saeed Bacha
  { id: 'p_lal_bacha', fullName: 'Lal Bacha', fatherId: 'p_saeed_bacha', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Gul Bacha
  { id: 'p_suleman_khan', fullName: 'Suleman Khan', fatherId: 'p_gul_bacha', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_roman_khan', fullName: 'Roman Khan', fatherId: 'p_gul_bacha', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_luqman_khan', fullName: 'Luqman Khan', fatherId: 'p_gul_bacha', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_usam_khan', fullName: 'Usam Khan', fatherId: 'p_gul_bacha', generation: 5, branchId: 'branch_zarfaraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Zarawar Khan
  { id: 'p_alam_zeb', fullName: 'Alam Zeb', fatherId: 'p_zarawar_khan', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_umar_zeb', fullName: 'Umar Zeb', fatherId: 'p_zarawar_khan', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_raham_zeb', fullName: 'Raham Zeb', fatherId: 'p_zarawar_khan', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_inayat_zeb', fullName: 'Inayat Zeb', fatherId: 'p_zarawar_khan', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_shan_zeb', fullName: 'Shan Zeb', fatherId: 'p_zarawar_khan', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_akram_zeb', fullName: 'Akram Zeb', fatherId: 'p_zarawar_khan', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_mubarak_zeb', fullName: 'Mubarak Zeb', fatherId: 'p_zarawar_khan', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Sultan Bacha (Lal Faraz line)
  { id: 'p_umar_farooq', fullName: 'Umar Farooq', fatherId: 'p_sultan_bacha', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_umar_sadiq', fullName: 'Umar Sadiq', fatherId: 'p_sultan_bacha', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_khalid_sultan', fullName: 'Khalid Sultan', fatherId: 'p_sultan_bacha', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_sajid', fullName: 'Sajid', fatherId: 'p_sultan_bacha', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_abass', fullName: 'Abass', fatherId: 'p_sultan_bacha', generation: 5, branchId: 'branch_lal_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Mehtab Khan
  { id: 'p_usman_ullah', fullName: 'Usman Ullah', fatherId: 'p_mehtab_khan', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_bacha_zeb', fullName: 'Bacha Zeb', fatherId: 'p_mehtab_khan', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Nawshad Khan
  { id: 'p_irshad_khan', fullName: 'Irshad Khan', fatherId: 'p_nawshad_khan', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_zakria_khan', fullName: 'Zakria Khan', fatherId: 'p_nawshad_khan', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Walayat Khan
  { id: 'p_imran_shahid', fullName: 'Imran Shahid', fatherId: 'p_walayat_khan', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_kamran_shahid', fullName: 'Kamran Shahid', fatherId: 'p_walayat_khan', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_adnan_shahid', fullName: 'Adnan Shahid', fatherId: 'p_walayat_khan', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Ihsan Ullah
  { id: 'p_salman_shahid', fullName: 'Salman Shahid', fatherId: 'p_ihsan_ullah', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_mehran_shahid', fullName: 'Mehran Shahid', fatherId: 'p_ihsan_ullah', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_saeed_ahmad', fullName: 'Saeed Ahmad', fatherId: 'p_ihsan_ullah', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Rahman Ullah
  { id: 'p_muhammad_rayan', fullName: 'Muhammad Rayan', fatherId: 'p_rahman_ullah', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_muhammad_hamdan', fullName: 'Muhammad Hamdan', fatherId: 'p_rahman_ullah', generation: 5, branchId: 'branch_anwar_faraz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Akbar Zada
  { id: 'p_sultan_zeb_khan', fullName: 'Sultan Zeb Khan', fatherId: 'p_akbar_zada', generation: 5, branchId: 'branch_nawaz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_shahid_zeb_khan', fullName: 'Shahid Zeb Khan', fatherId: 'p_akbar_zada', generation: 5, branchId: 'branch_nawaz', aliveStatus: 'alive', createdAt: now, updatedAt: now },

  // Sons of Amir Zada
  { id: 'p_tahir_zeb_khan', fullName: 'Tahir Zeb Khan', fatherId: 'p_amir_zada', generation: 5, branchId: 'branch_nawaz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_sadaqat_zeb_khan', fullName: 'Sadaqat Zeb Khan', fatherId: 'p_amir_zada', generation: 5, branchId: 'branch_nawaz', aliveStatus: 'alive', biography: 'Author/compiler of the Mazid Khail family history record.', createdAt: now, updatedAt: now },
  { id: 'p_liaqat_zeb_khan', fullName: 'Liaqat Zeb Khan', fatherId: 'p_amir_zada', generation: 5, branchId: 'branch_nawaz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_hidayat_zeb_khan', fullName: 'Hidayat Zeb Khan', fatherId: 'p_amir_zada', generation: 5, branchId: 'branch_nawaz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
  { id: 'p_ahmad_zeb_khan', fullName: 'Ahmad Zeb Khan', fatherId: 'p_amir_zada', generation: 5, branchId: 'branch_nawaz', aliveStatus: 'alive', createdAt: now, updatedAt: now },
];

export const initialRelationships: Relationship[] = initialPeople
  .filter((p) => p.fatherId)
  .map((p) => ({
    id: `rel_${p.fatherId}_${p.id}`,
    type: 'parent_child',
    personId1: p.fatherId!,
    personId2: p.id,
    createdAt: now,
  }));

export const initialDatabase: FamilyDatabase = {
  people: initialPeople,
  relationships: initialRelationships,
  branches: initialBranches,
  auditLogs: [
    {
      id: 'log_seed_001',
      timestamp: now,
      action: 'DATA_RESTORED',
      details: 'Initial database seeded directly from the historical Mazid Khail document compiled by Sadaqat Zeb Khan.',
    },
  ],
  adminPasswordHash: 'admin123',
  version: '1.0.0',
  lastUpdated: now,
};
