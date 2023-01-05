var dmb;
(function (dmb) {
    var premiumEncounter;
    (function (premiumEncounter) {
        const READER = new FileReader();
        let creaturePictureInput;
        let creaturePictureDisplay;
        let creaturePictureFileInput;
        let creaturePictureInputOverlay;
        function Init() {
            creaturePictureInput = $("#creaturePictureInput");
            GetIsPremium();
            if (!premiumEncounter.IsPremium)
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
        premiumEncounter.Init = Init;
        function SetPictureFromUpload(input) {
            READER.readAsDataURL(input.files[0]);
        }
        premiumEncounter.SetPictureFromUpload = SetPictureFromUpload;
        function GetIsPremium() {
            premiumEncounter.IsPremium = creaturePictureInput.val() != null;
        }
        function SetPictureData(pictureData) {
            creaturePictureDisplay.attr("src", pictureData);
        }
        premiumEncounter.SetPictureData = SetPictureData;
        function GetPictureValue() {
            return creaturePictureInput.attr("src");
        }
        premiumEncounter.GetPictureValue = GetPictureValue;
        function ClearPictureInput() {
            creaturePictureInput.attr("src", "");
            creaturePictureInput.hide();
            creaturePictureInputOverlay.show();
            creaturePictureFileInput.val('');
        }
        premiumEncounter.ClearPictureInput = ClearPictureInput;
    })(premiumEncounter = dmb.premiumEncounter || (dmb.premiumEncounter = {}));
})(dmb || (dmb = {}));
$(document).ready(function () {
    dmb.premiumEncounter.Init();
});
//# sourceMappingURL=premiumEncounter.js.map