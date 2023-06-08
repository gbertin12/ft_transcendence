async getHourlyMessages(channel_id: number, max_hours: number = 12, staff: ChannelStaff) {

	if (max_hours > 24 || max_hours <= 0) {
		throw new HttpException("max_hours must be between 1 and 24", 400);
	}
	let messages = await this.dbService.message.findMany({
		where: {
			AND: [
				{
					channel_id: channel_id,
				},
				{
					timestamp: {
						gte: new Date(Date.now() - (max_hours * 60 * 60 * 1000))
					}
				}
			]
		},
		select: {
			timestamp: true,
			sender_id: true
		}
	});
	const max = new Date();
	const min = new Date(max.getTime() - (max_hours * 60 * 60 * 1000));
	// Map of relative hours (from now) to messages [-min, max]
	let hourlyMessages: Record<number, HourlyEntry> = {};
	for (let i = -max_hours; i <= 0; i++) {
		let hour = max.getHours() - i;
		if (hour < 0) {
			hour += 24; 
		hourlyMessages[i] = {
			usersCount: 0,
			adminCount: 0,
			ownerCount: 0,
			hour: hour
		};
	}

	for (let message of messages) {
		// number of hours between max and message
		const relativeHour = -Math.floor((message.timestamp.getTime() - min.getTime()) / (60 * 60 * 1000));
		let permLevel: number = 0;
		if (message.sender_id === staff.owner_id) {
			permLevel = 2;
		} else if (staff.administrators.includes(message.sender_id)) {
			permLevel = 1;
		}
		console.log(relativeHour, permLevel)
		if (relativeHour in hourlyMessages) {
			switch (permLevel) {
				case 0:
					hourlyMessages[relativeHour].usersCount++;
					break;
				case 1:
					hourlyMessages[relativeHour].adminCount++;
					break;
				case 2:
					hourlyMessages[relativeHour].ownerCount++;
					break;
			}
		}
	}
	return hourlyMessages;
}