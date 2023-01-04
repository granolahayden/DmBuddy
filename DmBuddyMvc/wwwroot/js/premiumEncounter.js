var dmb;
(function (dmb) {
    var premiumEncounter;
    (function (premiumEncounter) {
        let creaturePictureInput;
        let creaturePictureDisplay;
        function Init() {
            creaturePictureInput = $("#creaturePictureInput");
            GetIsPremium();
            if (!premiumEncounter.IsPremium)
                return;
            creaturePictureDisplay = $("#creaturePictureDisplay");
        }
        premiumEncounter.Init = Init;
        function GetIsPremium() {
            premiumEncounter.IsPremium = creaturePictureInput.val() != null;
        }
        function GetPictureValue() {
            return creaturePictureInput.attr("src");
        }
        premiumEncounter.GetPictureValue = GetPictureValue;
        function ClearPictureInput() {
            creaturePictureInput.attr("src", "");
        }
        premiumEncounter.ClearPictureInput = ClearPictureInput;
        function SetPictureData(pictureData) {
            creaturePictureDisplay.attr("src", pictureData);
        }
        premiumEncounter.SetPictureData = SetPictureData;
    })(premiumEncounter = dmb.premiumEncounter || (dmb.premiumEncounter = {}));
})(dmb || (dmb = {}));
$(document).ready(function () {
    dmb.premiumEncounter.Init();
});
//# sourceMappingURL=premiumEncounter.js.map