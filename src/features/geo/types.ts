export type CommunityOption = { code: string; name: string };
export type ProvinceOption = { code: string; name: string; communityCode: string };
export type MunicipalityOption = { code: string; name: string };

/** Resolved location of an opportunity (names for display). */
export type LocationNames = {
  municipalityCode: string;
  municipality: string;
  provinceCode: string;
  province: string;
  communityCode: string;
  community: string;
};
