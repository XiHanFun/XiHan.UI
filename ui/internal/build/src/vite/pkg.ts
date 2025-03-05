import { entries, packages } from "../constants/packages";

export const getGeneralPkgPath = (): string => {
  return packages.xihanui;
};

export const getGeneralPkgEntries = (): string => {
  return entries["xihan-ui"];
};

export const getAllPkgName = (): string[] => {
  return Object.keys(packages);
};

export const getSubPackagePath = (name: string): string => {
  if (packages[name as keyof typeof packages]) {
    return packages[name as keyof typeof packages];
  }
  throw new Error(`Package ${name} not found`);
};

export const getSubPackageEntries = (name: string): string => {
  if (entries[name as keyof typeof entries]) {
    return entries[name as keyof typeof entries];
  }
  throw new Error(`Entries for ${name} not found`);
};

export const getAllPackageEntries = (): string[] => {
  return Object.keys(entries);
};
