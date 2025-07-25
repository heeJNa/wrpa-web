interface MenuItem {
    label: string;
    icon?: string;
    to?: string;
    items?: MenuItem[];
}
interface BreadCrumbItem {
    label: string;
    route: string;
    icon?: string;
}
export const menus: MenuItem[] = [
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }],
    },
    {
        label: 'Management',
        items: [{ label: '계정', icon: 'pi pi-fw pi-users', to: '/management/accounts' }, { label: '패키지', icon: 'pi pi-fw pi-box', to: '/management/packages' }],
    },
    // {
    //   label: 'Package',
    //   items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }],
    // },
    {
        label: 'RPA',
        items: [{ label: '작업PC', icon: 'pi pi-fw pi-desktop', to: '/rpa/worker' },
        { label: '작업파일', icon: 'pi pi-fw pi-file', to: '/rpa/file' },
        { label: '작업일정', icon: 'pi pi-fw pi-calendar-clock', to: '/rpa/schedule' },
        { label: '작업현황', icon: 'pi pi-fw pi-list-check', to: '/rpa/state' }
        ],
    },
]

export const getMenuLabelChainFindByMenuPath = (
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
            const childPath = getMenuLabelChainFindByMenuPath(menu.items, targetTo);
            if (childPath) {
                return [menu.label, ...childPath];
            }
        }
    }
    return null; // 못 찾은 경우
}

export const getMenuChainFindByMenuPath = (
    menus: MenuItem[],
    targetTo: string
): BreadCrumbItem[] | null => {
    for (const menu of menus) {
        // 현재 메뉴의 to와 일치하면 label 반환
        if (menu.to === targetTo) {
            return [{ label: menu.label, route: menu.to || '', icon: menu.icon || '' }];
        }
        // 하위 items가 있으면 재귀 탐색
        if (menu.items) {
            const childPath = getMenuChainFindByMenuPath(menu.items, targetTo);
            if (childPath) {
                return [{ label: menu.label, route: menu.to || '', icon: menu.icon || '' }, ...childPath];
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