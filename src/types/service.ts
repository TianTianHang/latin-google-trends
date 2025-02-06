export interface ServiceInstance {
    service_name: string;
    instance_id: string;
    host: string;
    port: number;
    health_check_url: string;
    last_health_check: string | null;
    is_healthy: boolean;
    heartbeat_interval: number;
  }