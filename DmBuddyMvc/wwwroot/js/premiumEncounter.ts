namespace dmb.premiumEncounter
{
    let creaturePictureInput: JQuery<HTMLElement>;
    let creaturePictureDisplay: JQuery<HTMLElement>;

    export var IsPremium: boolean;

    export function Init(): void {
        creaturePictureInput = $("#creaturePictureInput");
        GetIsPremium();
        if (!IsPremium)
            return;

        creaturePictureDisplay = $("#creaturePictureDisplay");
    }

    function GetIsPremium(): void {
        IsPremium = creaturePictureInput.val() != null;
    }

    export function GetPictureValue(): string {
        return creaturePictureInput.attr("src");
    }

    export function ClearPictureInput(): void {
        creaturePictureInput.attr("src", "");
    }

    export function SetPictureData(pictureData: string): void {
        creaturePictureDisplay.attr("src", pictureData);
    }
}

$(document).ready(function (): void {
    dmb.premiumEncounter.Init();
});