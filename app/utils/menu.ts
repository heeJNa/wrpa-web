interface MenuItem {
    label: string;
    icon?: string;
    to?: string;
    items?: MenuItem[];
}
export const menus: MenuItem[] = [
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }],
    },
    {
        label: 'Management',
        items: [{ label: '계정', icon: 'pi pi-fw pi-users', to: '/management/accounts' }],
    },
    // {
    //   label: 'Package',
    //   items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }],
    // },
    {
        label: 'RPA',
        items: [{ label: '작업PC', icon: 'pi pi-fw pi-desktop', to: '/rpa/worker' }],
    },
]

export const getMenuChainFindByMenuPath = (
    menus: MenuItem[],
    targetTo: string
): string[] | null => {
    for (const menu of menus) {
        // 현재 메뉴의 to와 일치하면 label 반환
        if (menu.to === targetTo) {
            return [menu.label];
        }
        // 하위 items가 있으면 재귀 탐색
        if (menu.items) {
            const childPath = getMenuChainFindByMenuPath(menu.items, targetTo);
            if (childPath) {
                return [menu.label, ...childPath];
            }
        }
    }
    return null; // 못 찾은 경우
}

export const convertMenuChainToString = (menuChain: string[] | null): string => {
    if (!menuChain || menuChain.length === 0) {
        return '메뉴를 찾을 수 없습니다';
    }
    return menuChain.join(' > ');
}