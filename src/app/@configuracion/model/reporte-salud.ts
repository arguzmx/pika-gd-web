export interface  ReporteSalud {
    status: string,
    totalDuration: string,
    entries: {
        identityserver: {
            data: any,
            duration: string,
            status: string
        },
        elasticsearch: {
            data: any,
            duration: string,
            status: string
        },
        rabbitmq: {
            data: any,
            duration: string,
            status: string
        },
        mysql: {
            data: any,
            duration: string,
            status: string
        }
    }
}