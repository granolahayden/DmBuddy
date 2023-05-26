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
        const creaturepicturedata = creaturePictureInput.attr("src");
        const approxsize = getSizeInBytes(creaturepicturedata)
        if (dmb.save.CanSave() && approxsize > 500000) {
            alert("Sorry, this image is too big to save (approximately " + approxsize +" bytes). We'll add your creature to the initiative, just without the image.");
            return "";
        }
            
        return creaturepicturedata;
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

    const getSizeInBytes = obj => {
        let str = null;
        if (typeof obj === 'string') {
            // If obj is a string, then use it
            str = obj;
        } else {
            // Else, make obj into a string
            str = JSON.stringify(obj);
        }
        // Get the length of the Uint8Array
        const bytes = new TextEncoder().encode(str).length;
        return bytes;
    };

    const logSizeInBytes = (description, obj) => {
        const bytes = getSizeInBytes(obj);
        console.log(`${description} is approximately ${bytes} B`);
    };
}

$(dmb.premiumEncounter.Init);