export interface CreateReservationDto {
    
    id: string;
    user_Id: string;
    date: Date;
    start_Time: Date;
    end_Time: Date;
    status: string;
    created_at: Date;
}