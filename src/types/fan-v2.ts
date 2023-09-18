import { Characteristic } from '../hap-types';
import { HapService, AccessoryTypeExecuteResponse } from '../interfaces';

export class Fanv2 {
  sync(service: HapService) {

    const attributes = {} as any;
    const traits = [
      'action.devices.traits.OnOff',
    ];

    // check if the fan has the RotationSpeed characteristic
    if (service.characteristics.find(x => x.type === Characteristic.RotationSpeed)) {
      traits.push('action.devices.traits.FanSpeed');
      attributes.supportsFanSpeedPercent = True
    }

    return {
      id: service.uniqueId,
      type: 'action.devices.types.FAN',
      traits,
      attributes,
      name: {
        defaultNames: [
          service.serviceName,
          service.accessoryInformation.Name,
        ],
        name: service.serviceName,
        nicknames: [],
      },
      willReportState: true,
      deviceInfo: {
        manufacturer: service.accessoryInformation.Manufacturer,
        model: service.accessoryInformation.Model,
      },
      customData: {
        aid: service.aid,
        iid: service.iid,
        instanceUsername: service.instance.username,
        instanceIpAddress: service.instance.ipAddress,
        instancePort: service.instance.port,
      },
    };
  }

  query(service: HapService) {
    const response = {
      on: service.characteristics.find(x => x.type === Characteristic.Active).value ? true : false,
      online: true,
    } as any;

    // check if the fan has the RotationSpeed characteristic
    if (service.characteristics.find(x => x.type === Characteristic.RotationSpeed)) {
      response.currentFanSpeedPercent = service.characteristics.find(x => x.type === Characteristic.RotationSpeed).value;
    }

    return response;
  }

  execute(service: HapService, command): AccessoryTypeExecuteResponse {
    if (!command.execution.length) {
      return { payload: { characteristics: [] } };
    }

    switch (command.execution[0].command) {
      case ('action.devices.commands.OnOff'): {
        const payload = {
          characteristics: [{
            aid: service.aid,
            iid: service.characteristics.find(x => x.type === Characteristic.Active).iid,
            value: command.execution[0].params.on ? 1 : 0,
          }],
        };
        return { payload };
      }
      case ('action.devices.commands.SetFanSpeed'): {
        const payload = {
          characteristics: [{
            aid: service.aid,
            iid: service.characteristics.find(x => x.type === Characteristic.RotationSpeed).iid,
            value: command.execution[0].params.fanSpeedPercent,
          },
          {
            aid: service.aid,
            iid: service.characteristics.find(x => x.type === Characteristic.Active).iid,
            value: command.execution[0].params.fanSpeedPercent ? 1 : 0,
          }],
        };
        return { payload };
      }
    }
  }

}
