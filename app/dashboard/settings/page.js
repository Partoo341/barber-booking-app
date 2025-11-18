// Add this to your settings page, after notifications section
// Working Hours Settings Component
function WorkingHoursSettings() {
    const { user } = useAuth()
    const [workingHours, setWorkingHours] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchWorkingHours()
    }, [user])

    const fetchWorkingHours = async () => {
        try {
            const { data, error } = await supabase
                .from('barbers')
                .select('working_hours')
                .eq('auth_id', user.id)
                .single()

            if (error) throw error
            setWorkingHours(data.working_hours || getDefaultWorkingHours())
        } catch (error) {
            console.error('Error fetching working hours:', error)
            setWorkingHours(getDefaultWorkingHours())
        } finally {
            setIsLoading(false)
        }
    }

    const updateWorkingHours = async (newHours) => {
        try {
            const { error } = await supabase
                .from('barbers')
                .update({ working_hours: newHours })
                .eq('auth_id', user.id)

            if (error) throw error
            setWorkingHours(newHours)
        } catch (error) {
            console.error('Error updating working hours:', error)
            alert('Failed to update working hours')
        }
    }

    const handleDayChange = (day, field, value) => {
        const updatedHours = {
            ...workingHours,
            [day]: {
                ...workingHours[day],
                [field]: field === 'enabled' ? value : value
            }
        }
        updateWorkingHours(updatedHours)
    }

    if (isLoading) {
        return <div>Loading working hours...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h2>
            <div className="space-y-4">
                {Object.entries(workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4 flex-1">
                            <label className="flex items-center space-x-3 flex-1">
                                <input
                                    type="checkbox"
                                    checked={hours.enabled}
                                    onChange={(e) => handleDayChange(day, 'enabled', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-medium text-gray-900 capitalize min-w-20">
                                    {day}
                                </span>
                            </label>

                            {hours.enabled && (
                                <div className="flex items-center space-x-2 flex-1">
                                    <input
                                        type="time"
                                        value={hours.start}
                                        onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="time"
                                        value={hours.end}
                                        onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {!hours.enabled && (
                            <span className="text-sm text-gray-500">Closed</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function getDefaultWorkingHours() {
    return {
        monday: { enabled: true, start: "09:00", end: "17:00" },
        tuesday: { enabled: true, start: "09:00", end: "17:00" },
        wednesday: { enabled: true, start: "09:00", end: "17:00" },
        thursday: { enabled: true, start: "09:00", end: "17:00" },
        friday: { enabled: true, start: "09:00", end: "17:00" },
        saturday: { enabled: false, start: "10:00", end: "16:00" },
        sunday: { enabled: false, start: "10:00", end: "16:00" }
    }
}