// Playback is YouTube-hosted. MP4s stay on disk for production but are not
// deployed to Vercel (public/**/*.mp4 is gitignored).

const GT_YOUTUBE: Record<number, string> = {
  1: 'XHTlWIReYIQ',
  2: '8oc2s1dHDOI',
  3: 'ans9WFH7hEk',
  4: '6BhjKhwLJf4',
  5: 'RUadQy3kGHw',
  6: 'I6EWltbRyDg',
  7: 'TJ8aBK3krEg',
  8: '0Ztyw4Kpv64',
  9: '00nLfQCZGN4',
  10: 'GSnoPAJCpuc',
  11: 'DM8it0McP2A',
  12: 'YeKkLY4IiyU',
  13: 'tK_7mZIN74Y',
  14: 'YdyFnN_wwNY',
  15: 'JrFqBI4uFic',
  16: 'EnJ_V3fSV3M',
  17: 'vHLsFyN8IaU',
  18: 'It7qxRbkhs0',
  19: 'QxfEe78ssF8',
  20: 'jAMzSuuhnLg',
  21: '6zIc7m7AIh8',
  22: 'JuwpFqkeMlY',
  23: 'z_TWt9SiX_s',
  24: 'z3wmzLVoxAk',
  25: 'My6Pqe8NrBo',
  26: 'Are-ZbHG4iE',
  27: 'frthI2Zo17A',
  28: '0aF6EaCZuug',
  29: 'ZgMTuVVw0TE',
  30: '55zI9NknqyY',
  31: 'YawupwlKuMk',
  32: 'HblcOhH0Bxw',
  33: 'YRvkJf5WofQ',
  34: 'J-fzg5NnwHg',
  35: 'Myw4ris-k-U',
  36: 'gVi1uXZjdHY',
  37: 'nZ8mczvH3J8',
  38: '7ns93zowOUw',
  39: 'AA4uCFXtQLg',
  40: 'KdyFeiVKvjE',
}

const BUFFETT_YOUTUBE: Record<number, string> = {
  1: 'PEOvE1ORaWo',
  2: '-V_uQEbMQzc',
  3: 'SaY-rDDFIL0',
  4: 'ZRg_1zpZicc',
  5: 'OBym9aOqayQ',
  6: 'OA3BIK8bpxU',
  7: 'NCn2atc_bGc',
  8: 'flBscmGhZ90',
  9: 'KjaqBGK6sV0',
  10: 'UIjaL3jXf8Y',
  11: 'ELs8IIdGVeo',
  12: 'Glf_qDs1TdA',
  13: 'oniPXiEHwtY',
  14: 'uiR17v2tjOk',
  15: 'suETIdEKT38',
  16: 'Eh3gIV-50So',
  17: 'HKkDslC6IXY',
  18: 'VnMDPhZ_UPg',
  19: 'jtBiEnZI9W8',
  20: 'nvmkeWGbyns',
  21: 't5xYpcjUiuk',
  22: 'dmBYiFlb3G0',
  23: 'gVKruwKmSkk',
  24: 'TweKLALb47o',
  25: 'AkS9djCd0I0',
  26: 'pu3DCNbqm4g',
  27: 'FKB1Ef4Z3jk',
  28: 'CjYYMXmcLHI',
  29: 'SdJuANndLFs',
  30: '4197TBM8Q3U',
  31: '-tmd-F_T2M0',
  32: 'dyDuQQPfucE',
  33: 'wu1mUZ-ySt4',
  34: 'BJ07USzO_eA',
  35: 'pZpdVDdBoLc',
  36: 'Ill0VnEn83M',
  37: 'oFHq4PlNSB8',
  38: 'g6RYAFX2QIM',
  39: '5dp6k28bbE8',
  40: '37rh8QZqE1k',
  41: 'ezU-EtrH8eU',
  42: 'exsvYn5hLm0',
  43: 'ml-vIjrKm0I',
  44: 'mllZ-ekQY8Q',
  45: 'Z4WQb0m59w8',
}

export function hasVideo(lessonId: number): boolean {
  return lessonId in GT_YOUTUBE
}

export function youtubeId(lessonId: number): string | undefined {
  return GT_YOUTUBE[lessonId]
}

export function posterSrc(lessonId: number): string {
  if (!hasVideo(lessonId)) return `${import.meta.env.BASE_URL}media/placeholder-poster.svg`
  return `${import.meta.env.BASE_URL}media/lesson-${String(lessonId).padStart(2, '0')}-poster.webp`
}

export function buffettHasVideo(lessonId: number): boolean {
  return lessonId in BUFFETT_YOUTUBE
}

export function buffettYoutubeId(lessonId: number): string | undefined {
  return BUFFETT_YOUTUBE[lessonId]
}

export function buffettPosterSrc(lessonId: number): string {
  if (!buffettHasVideo(lessonId)) return `${import.meta.env.BASE_URL}media/placeholder-poster.svg`
  return `${import.meta.env.BASE_URL}media/buffett-florida-1998/lesson-${String(lessonId).padStart(2, '0')}-poster.webp`
}
