export type SplitText = {
	lead: string;
	lastWord: string;
};

export function splitLastWord(text: string): SplitText {
	const trimmed = text.trim();
	const lastSpaceIndex = trimmed.lastIndexOf(" ");
	return lastSpaceIndex === -1
		? {
				lead: "",
				lastWord: trimmed,
			}
		: {
				lead: trimmed.substring(0, lastSpaceIndex),
				lastWord: trimmed.substring(lastSpaceIndex + 1),
			};
}
