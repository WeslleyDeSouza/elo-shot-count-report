import { AuthService } from "@ui-lib/apiClient";
import { inject } from "@angular/core";
import { catchError, debounceTime, firstValueFrom, of } from "rxjs";
import { Store } from "@ngrx/store";

export namespace MenuUtils {
  export interface MenuItem {
    appId: number;
    domain: string;
    tenantId: string | null;
    title: string;
    path: string;
    pathMobile: string | null;
    img: string | null;
    icon: string;
    imgDashboard: string | null;
  }

  export interface MenuCategory {
    categoryId: number;
    domain: string;
    tenantId: string | null;
    title: string;
    children: MenuItem[];
  }

  export const menuLoader = ( cb?: any) => () => {
    const [ role] = [ inject(AuthService)];
    return role.authRoleGetAllowedAppsAsMenu().pipe(
      catchError(() => of([])),
      debounceTime(300),
    );
  };

  export const menuLoaderPromise = ( cb?: any) => firstValueFrom(
    menuLoader(cb)()
  )

  // Source interfaces
  export interface MenuItem {
    appId: number;
    domain: string;
    tenantId: string | null;
    title: string;
    path: string;
    pathMobile: string | null;
    img: string | null;
    icon: string;
    imgDashboard: string | null;
    children: MenuItem[];
  }

  export interface MenuCategory {
    categoryId: number;
    domain: string;
    tenantId: string | null;
    title: string;
    children: MenuItem[];
  }

// Target type
  export type MenuItemType = {
    key: string
    label: string
    isTitle?: boolean
    icon?: string
    url?: string

    badge?: {
      variant: string
      text: string
    }
    parentKey?: string
    isDisabled?: boolean
    collapsed?: boolean
    children?: MenuItemType[]
  }

// Main function to map categories with deeply nested items
  export function mapMenuCategories(categories: MenuCategory[]): MenuItemType[] {
    function mapMenuItem(item: MenuItem, parentKey?: string): MenuItemType {
      const itemKey = `${item.domain}-${item.appId}`;

      const mappedItem: MenuItemType = {
        key: itemKey,
        label: item.title,
        icon: item.icon,
        url: item.path,
        parentKey,
        isDisabled: false
      };

      // Recursively map children if they exist
      if (item.children && item.children.length > 0) {
        mappedItem.children = item.children.map(child =>
          mapMenuItem(child, itemKey)
        );
      }

      return mappedItem;
    }

    return categories.map(category => {
      const categoryKey = `${category.domain}-${category.categoryId}`;

      return {
        key: categoryKey,
        label: category.title,
        isTitle: true,
        collapsed: false,
        children: category.children.map(item => mapMenuItem(item, categoryKey))
      };
    });
  }

  export async function loadAndDispatch(store:Store, fnLoader:any){
    const [menuOrg, layoutMod] = await Promise.all([
      menuLoaderPromise(),
      fnLoader()
    ]);
    const menuCategories = mapMenuCategories(menuOrg as any);
    const menu =  [
      menuCategories,
    ].flat(2);
    store.dispatch(layoutMod.setMenuData({menu}))
    return {loaded:true};
  }
}

