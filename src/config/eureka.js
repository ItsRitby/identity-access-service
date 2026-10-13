import { Eureka } from 'eureka-js-client';

let eurekaClient = null;

export function startEurekaClient() {
  const enabled = (process.env.EUREKA_ENABLED || 'true').toLowerCase() === 'true';
  if (!enabled) {
    console.log('Eureka client disabled (EUREKA_ENABLED=false)');
    return;
  }

  const eurekaHost = process.env.EUREKA_HOST || 'localhost';
  const eurekaPort = parseInt(process.env.EUREKA_PORT || '8761', 10);
  const appName = process.env.EUREKA_APP_NAME || 'identity-access-service';
  const instanceHost = process.env.EUREKA_INSTANCE_HOST || 'localhost';
  const servicePort = parseInt(process.env.PORT || '3001', 10);

  eurekaClient = new Eureka({
    instance: {
      app: appName.toUpperCase(),
      instanceId: `${appName}:${instanceHost}:${servicePort}`,
      hostName: instanceHost,
      ipAddr: instanceHost,
      port: { $: servicePort, '@enabled': true },
      vipAddress: appName,
      statusPageUrl: `http://${instanceHost}:${servicePort}/health`,
      healthCheckUrl: `http://${instanceHost}:${servicePort}/health`,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    eureka: {
      host: eurekaHost,
      port: eurekaPort,
      servicePath: '/eureka/apps/',
      maxRetries: 3,
      requestRetryDelay: 3000,
    },
  });

  eurekaClient.logger.level('warn');

  eurekaClient.start((error) => {
    if (error) {
      console.warn(
        `Eureka registration skipped: ${error.message}. Service continues without registration.`
      );
    } else {
      console.log(`Registered in Eureka as ${appName}`);
    }
  });
}

export function stopEurekaClient() {
  if (!eurekaClient) return;
  try {
    eurekaClient.stop();
    console.log('Eureka client stopped');
  } catch (error) {
    console.warn('Error while stopping Eureka client:', error.message);
  }
}