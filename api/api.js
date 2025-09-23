export async function sendToRoistat(formData, roistatVisitCookie = 'nocookie') {
    // Подготовка данных для Roistat
    const roistatData = {
        'roistat': roistatVisitCookie,
        'key': process.env.ROISTAT_API_KEY || '', // Ключ из .env
        'title': formData.title || 'Новая заявка с сайта',
        'comment': formData.comment || '',
        'name': formData.name || '',
        'email': formData.email || '',
        'phone': formData.phone || '',
        'order_creation_method': formData.order_creation_method || '',
        'is_need_callback': formData.is_need_callback || '0',
        'callback_phone': formData.callback_phone || '',
        'sync': formData.sync || '0',
        'is_need_check_order_in_processing': formData.is_need_check_order_in_processing || '1',
        'is_need_check_order_in_processing_append': formData.is_need_check_order_in_processing_append || '1',
        'is_skip_sending': formData.is_skip_sending || '1',
        'fields': {
            'charset': 'UTF-8', // В JavaScript обычно UTF-8
            // Дополнительные поля
            ...formData.fields
        }
    };

    try {
        // Отправка данных в Roistat
        const response = await fetch(
            `https://cloud.roistat.com/api/proxy/1.0/leads/add?${new URLSearchParams(roistatData).toString()}`,
            {
                method: 'GET', // Roistat использует GET запросы
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Roistat API error: ${response.status}`);
        }

        const result = await response.text();
        console.log('✅ Данные отправлены в Roistat:', result);
        return { success: true, data: result };

    } catch (error) {
        console.error('❌ Ошибка отправки в Roistat:', error);
        return { success: false, error: error.message };
    }
}

// Упрощенная версия для быстрой интеграции
export async function sendSimpleLead({ name, email, phone, comment = '' }) {
    const formData = {
        title: `Заявка от ${name}`,
        name: name,
        email: email,
        phone: phone,
        comment: comment,
        fields: {
            'source': 'website',
            'timestamp': new Date().toISOString()
        }
    };

    return await sendToRoistat(formData);
}