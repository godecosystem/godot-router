import type { DocPrivateAccess } from '$lib/docs/server/navigation/define-doc-navigation';

export function canAccessDoc(role: string | boolean, access?: DocPrivateAccess): boolean {
	if (access === undefined || access === false) {
		return true;
	}

	if (access === true) {
		return Boolean(role);
	}

	if (Array.isArray(access)) {
		return access.includes(role as string);
	}

	return role === access;
}
