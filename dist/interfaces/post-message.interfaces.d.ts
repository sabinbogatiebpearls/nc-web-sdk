import { ComponentNameType } from "../common/enums";
export interface ICommonISdkData {
    frontendAccessToken: string;
    publishableKey: string;
    componentName: ComponentNameType;
    other?: any;
}
export interface ISdkPostMessagePayload {
    source: 'NUVEI_FRONTEND_SDK';
    type: "SDK_COMMUNICATION";
    data: ICommonISdkData;
}
//# sourceMappingURL=post-message.interfaces.d.ts.map