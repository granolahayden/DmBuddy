namespace dmb.premiumEncounter
{
    const READER = new FileReader();

    let creaturePictureInput: JQuery<HTMLElement>;
    let creaturePictureDisplay: JQuery<HTMLElement>;
    let creaturePictureFileInput: JQuery<HTMLElement>;
    let creaturePictureInputOverlay: JQuery<HTMLElement>;

    export var IsPremium: boolean;

    export function Init(): void {
        creaturePictureInput = $("#creaturePictureInput");
        GetIsPremium();
        if (!IsPremium)
            return;

        creaturePictureDisplay = $("#creaturePictureDisplay");
        creaturePictureFileInput = $("#creaturePictureFileInput");
        creaturePictureInputOverlay = $("#creaturePictureOverlay");

        READER.addEventListener("load", () => {
            creaturePictureInput.attr("src", READER.result.toString());
            creaturePictureInput.show();
            creaturePictureInputOverlay.hide();
        });
    }

    export function SetPictureFromUpload(input: HTMLInputElement): void {
        READER.readAsDataURL(input.files[0]);
    }

    function GetIsPremium(): void {
        IsPremium = creaturePictureInput.val() != null;
    }

    export function SetPictureData(pictureData: string): void {
        creaturePictureDisplay.attr("src", pictureData);
    }

    export function GetPictureValue(): string {
        return creaturePictureInput.attr("src");
    }

    export function ClearPictureInput(): void {
        creaturePictureInput.attr("src", "");
        creaturePictureInput.hide();
        creaturePictureInputOverlay.show();
        creaturePictureFileInput.val('');
    }

    export function SetNotesModalPicture(pictureData: string): void {
        $("#creatureNotesModalPic").attr("src", pictureData);
    }

}

$(document).ready(function (): void {
    dmb.premiumEncounter.Init();
});