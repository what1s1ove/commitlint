import * as ensure from "@commitlint/ensure";
import message from "@commitlint/message";
import { SyncRule } from "@commitlint/types";

export const scopeEnum: SyncRule<
	| string[]
	| {
			scopeEnums: string[];
			delimiters?: string[];
	  }
> = ({ scope }, when = "always", value = []) => {
	const scopeEnums = Array.isArray(value) ? value : value.scopeEnums;

	if (!scope || !scopeEnums.length) {
		return [true, ""];
	}

	const delimiters =
		Array.isArray(value) || !value.delimiters?.length
			? ["/", "\\", ","]
			: value.delimiters;
	const delimiterPatterns = delimiters.map((delimiter) => {
		return delimiter === ","
			? ", ?"
			: delimiter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	});
	const messageScopes = scope.split(new RegExp(delimiterPatterns.join("|")));
	const errorMessage = ["scope must", `be one of [${scopeEnums.join(", ")}]`];
	const isScopeInEnum = (scope: string) => ensure.enum(scope, scopeEnums);
	let isValid;

	if (when === "never") {
		isValid = !messageScopes.some(isScopeInEnum) && !isScopeInEnum(scope);
		errorMessage.splice(1, 0, "not");
	} else {
		isValid = messageScopes.every(isScopeInEnum) || isScopeInEnum(scope);
	}

	return [isValid, message(errorMessage)];
};
