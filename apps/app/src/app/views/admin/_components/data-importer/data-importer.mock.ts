import {ArealData, WeaponData} from "./data-importer.component";

export const dataImporterArealMock:ArealData = {
  id: "ff4c4dbd-dad5-4265-bfcc-457bbbb49fe*",
  name: "1100 Meiringen",
  code: 1100,
  areas: [
    {
      id: "035d3ccb-6839-4690-b0f6-506f19aa5163",
      categoryId: "ff4c4dbd-dad5-4265-bfcc-457bbbb49fe0",
      name: "25 m Anlage",
      enabled: true
    }
  ]
}

export const dataImporterWeaponMock = {
  id: "6225ab0e-4439-4c36-b3f2-8f28600c27b*",
  name: "Artilleriewaffen / Armes d'artillerie",
  code: null,
  deletedAt: null,
  weapons: [
    {
      id: "4ca5fbea-c03d-4c09-8bb2-2bea2ab91895",
      categoryId: "6225ab0e-4439-4c36-b3f2-8f28600c27b4",
      name: "PzHb74(Ldg2EUG)",
      nameDe: "Panzerhaubitze 74; 15.5 cm STG Ldg 2 EUG",
      nameFr: "Obusier blindé 74 ; 15.5 cm STG charge 2 EUG",
      nameIt: "",
      enabled: false,
      inWeight: false,
      deletedAt: null
    }
  ]
}

export const dataImporterArealTemplateMock = {
  id: "example-category-id",
  name: "Example Category",
  code: 1000,
  areas: [
    {
      id: "example-area-id",
      categoryId: "example-category-id",
      name: "Example Area",
      enabled: true
    }
  ]
}

export const dataImporterWeaponTemplateMock:WeaponData = {
  id: "example-category-id",
  name: "Example Category",
  code: 100,
  weapons: [
    {
      id: "example-weapon-id",
      categoryId: "example-category-id",
      name: "Example Weapon",
      nameDe: "Beispiel Waffe",
      nameFr: "Arme d'exemple",
      nameIt: "Arma di esempio",
      enabled: true,
      inWeight: false,
    }
  ]
}
