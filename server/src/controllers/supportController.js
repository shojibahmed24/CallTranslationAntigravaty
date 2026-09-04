import { v4 as uuidv4 } from 'uuid';
import supabase from '../database/supabaseClient.js';

export const createTicket = async (req, res) => {
  try {
    const user = req.user;
    const { category, subject, initialMessage, priority = 'normal' } = req.body;

    if (!category || !subject || !initialMessage) {
      return res.status(400).json({ success: false, message: 'Category, subject, and message are required.' });
    }

    const newTicket = {
      id: `tkt_${uuidv4().substring(0, 8)}`,
      user_id: user.id,
      user_name: user.name,
      user_phone: user.phone_number,
      category, // 'payment', 'translation', 'otp', 'storage', 'general'
      subject,
      status: 'open',
      priority,
      messages: [
        {
          sender: 'user',
          senderName: user.name,
          text: initialMessage,
          createdAt: new Date().toISOString()
        }
      ]
    };

    const { data: ticket, error } = await supabase.from('support_tickets').insert([newTicket]).select().single();
    if (error) throw error;

    return res.json({
      success: true,
      message: 'Support ticket submitted successfully. Our admin team will respond promptly.',
      ticket: ticket
    });
  } catch (err) {
    console.error('createTicket error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create support ticket.' });
  }
};

export const getUserTickets = async (req, res) => {
  try {
    const user = req.user;
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    return res.json({ success: true, tickets });
  } catch (err) {
    console.error('getUserTickets error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
  }
};

export const addTicketMessage = async (req, res) => {
  try {
    const user = req.user;
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const { data: ticket, error: fetchErr } = await supabase.from('support_tickets').select('*').eq('id', ticketId).eq('user_id', user.id).single();
    if (fetchErr || !ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    const currentMessages = ticket.messages || [];
    currentMessages.push({
      sender: 'user',
      senderName: user.name,
      text: message,
      createdAt: new Date().toISOString()
    });

    const { data: updatedTicket, error: updateErr } = await supabase
      .from('support_tickets')
      .update({
        messages: currentMessages,
        status: 'open',
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.json({ success: true, ticket: updatedTicket });
  } catch (err) {
    console.error('addTicketMessage error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add message.' });
  }
};
