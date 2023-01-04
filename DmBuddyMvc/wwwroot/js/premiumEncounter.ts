namespace dmb.premiumEncounter
{
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

        creaturePictureFileInput.on('input', function (event: JQueryEventObject) {
            const input: HTMLInputElement = document.querySelector('input[type=file]');
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                // convert image file to base64 string
                creaturePictureInput.attr("src", reader.result.toString());
                creaturePictureInput.show();
                creaturePictureInputOverlay.hide();
            }, false);
            if (input) {
                reader.readAsDataURL(input.files[0]);
            }
        });
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

    

}

$(document).ready(function (): void {
    dmb.premiumEncounter.Init();
});