import {CharacteristicValue, Logger, PlatformAccessory, Service} from "homebridge";
import {MelviewMitsubishiHomebridgePlatform} from "../platform";
import {Unit} from "../data";
import {WithUUID} from "hap-nodejs";
import {CommandPower, CommandRotationSpeed} from "../melviewCommand";

export abstract class AbstractService {
    protected service: Service;
    public readonly device: Unit;
    protected constructor(
        protected readonly platform: MelviewMitsubishiHomebridgePlatform,
        protected readonly accessory: PlatformAccessory
    ) {
        this.device = accessory.context.device;
        if (!this.device.name) {
            this.device.name = this.getDeviceRoom();
        }
        this.log.info("Set Device:", this.device.name)
        this.service = this.accessory.getService(this.getServiceType()) ||
            this.accessory.addService(this.getServiceType());
        this.service.setCharacteristic(this.platform.Characteristic.Name, this.device.name);

        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onSet(this.setActive.bind(this))
            .onGet(this.getActive.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .onSet(this.setRotationSpeed.bind(this))
            .onGet(this.getRotationSpeed.bind(this));

    }

    protected abstract getServiceType<T extends WithUUID<typeof Service>>() : T
    protected abstract getDeviceRoom() : string;
    protected abstract getDeviceName() : string;

    get characterisitc() {
        return this.platform.api.hap.Characteristic;
    }

    public getService() : Service {
        return this.service!;
    }

    abstract setActive(value: CharacteristicValue);

    abstract getActive(): Promise<CharacteristicValue>;

    abstract getRotationSpeed(): Promise<CharacteristicValue>;

    abstract setRotationSpeed(value: CharacteristicValue);

    protected get log () : Logger {
        return this.platform.log;
    }
}