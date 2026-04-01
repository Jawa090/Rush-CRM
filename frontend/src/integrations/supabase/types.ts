export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_read: boolean
          message: string | null
          metadata: Json | null
          org_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json | null
          org_id: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json | null
          org_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_connections: {
        Row: {
          access_token: string | null
          calendar_id: string | null
          calendar_name: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          last_sync_at: string | null
          last_sync_token: string | null
          microsoft_calendar_id: string | null
          microsoft_email: string | null
          org_id: string
          provider: string
          refresh_token: string | null
          sync_enabled: boolean | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          last_sync_token?: string | null
          microsoft_calendar_id?: string | null
          microsoft_email?: string | null
          org_id: string
          provider: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          last_sync_token?: string | null
          microsoft_calendar_id?: string | null
          microsoft_email?: string | null
          org_id?: string
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          external_calendar_id: string | null
          external_provider: string | null
          id: string
          is_all_day: boolean | null
          is_synced: boolean | null
          location: string | null
          org_id: string
          recurrence_exception_dates: string[] | null
          recurrence_rule: string | null
          start_time: string
          sync_token: string | null
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          external_calendar_id?: string | null
          external_provider?: string | null
          id?: string
          is_all_day?: boolean | null
          is_synced?: boolean | null
          location?: string | null
          org_id: string
          recurrence_exception_dates?: string[] | null
          recurrence_rule?: string | null
          start_time: string
          sync_token?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          external_calendar_id?: string | null
          external_provider?: string | null
          id?: string
          is_all_day?: boolean | null
          is_synced?: boolean | null
          location?: string | null
          org_id?: string
          recurrence_exception_dates?: string[] | null
          recurrence_rule?: string | null
          start_time?: string
          sync_token?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_settings: {
        Row: {
          created_at: string
          default_event_duration: number | null
          default_view: string
          org_id: string
          show_weekends: boolean | null
          timezone: string
          updated_at: string
          user_id: string
          working_days: number[] | null
          working_hours_end: string
          working_hours_start: string
        }
        Insert: {
          created_at?: string
          default_event_duration?: number | null
          default_view?: string
          org_id: string
          show_weekends?: boolean | null
          timezone?: string
          updated_at?: string
          user_id: string
          working_days?: number[] | null
          working_hours_end?: string
          working_hours_start?: string
        }
        Update: {
          created_at?: string
          default_event_duration?: number | null
          default_view?: string
          org_id?: string
          show_weekends?: boolean | null
          timezone?: string
          updated_at?: string
          user_id?: string
          working_days?: number[] | null
          working_hours_end?: string
          working_hours_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          call_direction: string | null
          callee_number: string | null
          caller_number: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          notes: string | null
          org_id: string
          phone_number: string
          provider_name: string
          rc_call_id: string | null
          rc_session_id: string | null
          recording_url: string | null
          started_at: string | null
          status: string
          transcript: string | null
          transcript_summary: string | null
          user_id: string
        }
        Insert: {
          call_direction?: string | null
          callee_number?: string | null
          caller_number?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          notes?: string | null
          org_id: string
          phone_number: string
          provider_name: string
          rc_call_id?: string | null
          rc_session_id?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          transcript_summary?: string | null
          user_id: string
        }
        Update: {
          call_direction?: string | null
          callee_number?: string | null
          caller_number?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          phone_number?: string
          provider_name?: string
          rc_call_id?: string | null
          rc_session_id?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          transcript_summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          assigned_to: string | null
          available_to_everyone: boolean | null
          comment: string | null
          company_type: string | null
          created_at: string
          email: string | null
          email_type: string | null
          employee_count: string | null
          id: string
          industry: string | null
          logo_url: string | null
          messenger: string | null
          messenger_type: string | null
          name: string
          notes: string | null
          org_id: string
          phone: string | null
          phone_type: string | null
          revenue: string | null
          revenue_currency: string | null
          updated_at: string
          user_id: string
          website: string | null
          website_type: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          available_to_everyone?: boolean | null
          comment?: string | null
          company_type?: string | null
          created_at?: string
          email?: string | null
          email_type?: string | null
          employee_count?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          messenger?: string | null
          messenger_type?: string | null
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
          phone_type?: string | null
          revenue?: string | null
          revenue_currency?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          website_type?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          available_to_everyone?: boolean | null
          comment?: string | null
          company_type?: string | null
          created_at?: string
          email?: string | null
          email_type?: string | null
          employee_count?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          messenger?: string | null
          messenger_type?: string | null
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          phone_type?: string | null
          revenue?: string | null
          revenue_currency?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          website_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_drives: {
        Row: {
          access_token: string | null
          connected_by: string
          created_at: string
          display_name: string
          drive_type: Database["public"]["Enums"]["drive_type"]
          id: string
          is_active: boolean
          network_path: string | null
          network_protocol: string | null
          org_id: string
          ownership: Database["public"]["Enums"]["drive_ownership"]
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          connected_by: string
          created_at?: string
          display_name: string
          drive_type: Database["public"]["Enums"]["drive_type"]
          id?: string
          is_active?: boolean
          network_path?: string | null
          network_protocol?: string | null
          org_id: string
          ownership?: Database["public"]["Enums"]["drive_ownership"]
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          connected_by?: string
          created_at?: string
          display_name?: string
          drive_type?: Database["public"]["Enums"]["drive_type"]
          id?: string
          is_active?: boolean
          network_path?: string | null
          network_protocol?: string | null
          org_id?: string
          ownership?: Database["public"]["Enums"]["drive_ownership"]
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_drives_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_mailboxes: {
        Row: {
          access_token: string | null
          created_at: string
          display_name: string | null
          email_address: string
          encrypted_password: string | null
          id: string
          imap_host: string | null
          imap_port: number | null
          imap_username: string | null
          is_active: boolean
          last_sync_at: string | null
          org_id: string
          provider: string
          refresh_token: string | null
          smtp_host: string | null
          smtp_port: number | null
          smtp_username: string | null
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          display_name?: string | null
          email_address: string
          encrypted_password?: string | null
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          imap_username?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          org_id: string
          provider: string
          refresh_token?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          display_name?: string | null
          email_address?: string
          encrypted_password?: string | null
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          imap_username?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          org_id?: string
          provider?: string
          refresh_token?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_mailboxes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          assigned_to: string | null
          available_to_everyone: boolean | null
          comment: string | null
          company_id: string | null
          contact_type: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          email_type: string | null
          first_name: string
          id: string
          included_in_export: boolean | null
          last_name: string | null
          messenger: string | null
          messenger_type: string | null
          notes: string | null
          org_id: string
          phone: string | null
          phone_type: string | null
          photo_url: string | null
          position: string | null
          salutation: string | null
          second_name: string | null
          source: string | null
          source_info: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          website: string | null
          website_type: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          available_to_everyone?: boolean | null
          comment?: string | null
          company_id?: string | null
          contact_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          email_type?: string | null
          first_name: string
          id?: string
          included_in_export?: boolean | null
          last_name?: string | null
          messenger?: string | null
          messenger_type?: string | null
          notes?: string | null
          org_id: string
          phone?: string | null
          phone_type?: string | null
          photo_url?: string | null
          position?: string | null
          salutation?: string | null
          second_name?: string | null
          source?: string | null
          source_info?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
          website_type?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          available_to_everyone?: boolean | null
          comment?: string | null
          company_id?: string | null
          contact_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          email_type?: string | null
          first_name?: string
          id?: string
          included_in_export?: boolean | null
          last_name?: string | null
          messenger?: string | null
          messenger_type?: string | null
          notes?: string | null
          org_id?: string
          phone?: string | null
          phone_type?: string | null
          photo_url?: string | null
          position?: string | null
          salutation?: string | null
          second_name?: string | null
          source?: string | null
          source_info?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
          website_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          org_id: string
          title: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          org_id: string
          title?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          org_id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_comments: {
        Row: {
          content: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_edited: boolean
          org_id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          is_edited?: boolean
          org_id: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_edited?: boolean
          org_id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_comments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "crm_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          assigned_to: string | null
          available_to_everyone: boolean | null
          client_type: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          currency: string | null
          expected_close_date: string | null
          feedback: string | null
          feedback_details: string | null
          hourly_rate: number | null
          hourly_rate_currency: string | null
          hours_of_work: string | null
          id: string
          invoice_amount: number | null
          invoice_currency: string | null
          invoice_link: string | null
          lost_at: string | null
          lost_reason: string | null
          notes: string | null
          org_id: string
          payment_method: string | null
          pipeline: string | null
          probability: number | null
          project_blueprints: Json | null
          project_type: string | null
          proposal_amount: number | null
          proposal_currency: string | null
          qa_status: string | null
          quotation_received: string | null
          scope: string | null
          source: string | null
          source_info: string | null
          stage: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          value: number | null
          won_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          available_to_everyone?: boolean | null
          client_type?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          expected_close_date?: string | null
          feedback?: string | null
          feedback_details?: string | null
          hourly_rate?: number | null
          hourly_rate_currency?: string | null
          hours_of_work?: string | null
          id?: string
          invoice_amount?: number | null
          invoice_currency?: string | null
          invoice_link?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          notes?: string | null
          org_id: string
          payment_method?: string | null
          pipeline?: string | null
          probability?: number | null
          project_blueprints?: Json | null
          project_type?: string | null
          proposal_amount?: number | null
          proposal_currency?: string | null
          qa_status?: string | null
          quotation_received?: string | null
          scope?: string | null
          source?: string | null
          source_info?: string | null
          stage?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
          won_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          available_to_everyone?: boolean | null
          client_type?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          expected_close_date?: string | null
          feedback?: string | null
          feedback_details?: string | null
          hourly_rate?: number | null
          hourly_rate_currency?: string | null
          hours_of_work?: string | null
          id?: string
          invoice_amount?: number | null
          invoice_currency?: string | null
          invoice_link?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          notes?: string | null
          org_id?: string
          payment_method?: string | null
          pipeline?: string | null
          probability?: number | null
          project_blueprints?: Json | null
          project_type?: string | null
          proposal_amount?: number | null
          proposal_currency?: string | null
          qa_status?: string | null
          quotation_received?: string | null
          scope?: string | null
          source?: string | null
          source_info?: string | null
          stage?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_permissions: {
        Row: {
          access_level: Database["public"]["Enums"]["drive_access_level"]
          created_at: string
          drive_id: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["drive_access_level"]
          created_at?: string
          drive_id: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["drive_access_level"]
          created_at?: string
          drive_id?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drive_permissions_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "connected_drives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_permissions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_attachments: {
        Row: {
          attachment_id: string
          content_disposition: string | null
          content_id: string | null
          created_at: string
          email_id: string
          filename: string
          id: string
          mime_type: string | null
          org_id: string
          size: number | null
          storage_path: string | null
        }
        Insert: {
          attachment_id: string
          content_disposition?: string | null
          content_id?: string | null
          created_at?: string
          email_id: string
          filename: string
          id?: string
          mime_type?: string | null
          org_id: string
          size?: number | null
          storage_path?: string | null
        }
        Update: {
          attachment_id?: string
          content_disposition?: string | null
          content_id?: string | null
          created_at?: string
          email_id?: string
          filename?: string
          id?: string
          mime_type?: string | null
          org_id?: string
          size?: number | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_attachments_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_attachments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_crm_links: {
        Row: {
          created_at: string
          email_id: string
          entity_id: string
          entity_type: string
          id: string
          link_type: string
          linked_by: string
          org_id: string
        }
        Insert: {
          created_at?: string
          email_id: string
          entity_id: string
          entity_type: string
          id?: string
          link_type?: string
          linked_by: string
          org_id: string
        }
        Update: {
          created_at?: string
          email_id?: string
          entity_id?: string
          entity_type?: string
          id?: string
          link_type?: string
          linked_by?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_crm_links_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_crm_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_signatures: {
        Row: {
          content_html: string
          created_at: string
          id: string
          is_default: boolean
          mailbox_id: string | null
          name: string
          org_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_html: string
          created_at?: string
          id?: string
          is_default?: boolean
          mailbox_id?: string | null
          name: string
          org_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_html?: string
          created_at?: string
          id?: string
          is_default?: boolean
          mailbox_id?: string | null
          name?: string
          org_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_signatures_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "connected_mailboxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_signatures_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sync_log: {
        Row: {
          completed_at: string | null
          created_at: string
          errors: Json | null
          id: string
          mailbox_id: string
          messages_synced: number | null
          org_id: string
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          id?: string
          mailbox_id: string
          messages_synced?: number | null
          org_id: string
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          id?: string
          mailbox_id?: string
          messages_synced?: number | null
          org_id?: string
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sync_log_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "connected_mailboxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sync_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          category: string | null
          created_at: string
          id: string
          name: string
          org_id: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body_html: string
          category?: string | null
          created_at?: string
          id?: string
          name: string
          org_id: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body_html?: string
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          attachments: Json | null
          bcc_addresses: Json | null
          body_html: string | null
          body_text: string | null
          cc_addresses: Json | null
          created_at: string
          email_references: string[] | null
          folder: string
          from_address: string
          from_name: string | null
          has_attachments: boolean
          id: string
          in_reply_to: string | null
          is_draft: boolean
          is_important: boolean | null
          is_read: boolean
          is_starred: boolean
          labels: Json | null
          mailbox_id: string
          message_id: string | null
          org_id: string
          received_at: string | null
          scheduled_at: string | null
          sent_at: string | null
          snippet: string | null
          subject: string | null
          thread_id: string | null
          to_addresses: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          bcc_addresses?: Json | null
          body_html?: string | null
          body_text?: string | null
          cc_addresses?: Json | null
          created_at?: string
          email_references?: string[] | null
          folder?: string
          from_address: string
          from_name?: string | null
          has_attachments?: boolean
          id?: string
          in_reply_to?: string | null
          is_draft?: boolean
          is_important?: boolean | null
          is_read?: boolean
          is_starred?: boolean
          labels?: Json | null
          mailbox_id: string
          message_id?: string | null
          org_id: string
          received_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_addresses?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          bcc_addresses?: Json | null
          body_html?: string | null
          body_text?: string | null
          cc_addresses?: Json | null
          created_at?: string
          email_references?: string[] | null
          folder?: string
          from_address?: string
          from_name?: string | null
          has_attachments?: boolean
          id?: string
          in_reply_to?: string | null
          is_draft?: boolean
          is_important?: boolean | null
          is_read?: boolean
          is_starred?: boolean
          labels?: Json | null
          mailbox_id?: string
          message_id?: string | null
          org_id?: string
          received_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_addresses?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "connected_mailboxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_drive_files: {
        Row: {
          created_at: string
          drive_connection_id: string
          entity_id: string
          entity_type: string
          file_id: string
          file_name: string
          file_size: number | null
          folder_path: string | null
          id: string
          linked_by: string
          mime_type: string | null
          org_id: string
          provider: string
          thumbnail_link: string | null
          web_view_link: string | null
        }
        Insert: {
          created_at?: string
          drive_connection_id: string
          entity_id: string
          entity_type: string
          file_id: string
          file_name: string
          file_size?: number | null
          folder_path?: string | null
          id?: string
          linked_by: string
          mime_type?: string | null
          org_id: string
          provider: string
          thumbnail_link?: string | null
          web_view_link?: string | null
        }
        Update: {
          created_at?: string
          drive_connection_id?: string
          entity_id?: string
          entity_type?: string
          file_id?: string
          file_name?: string
          file_size?: number | null
          folder_path?: string | null
          id?: string
          linked_by?: string
          mime_type?: string | null
          org_id?: string
          provider?: string
          thumbnail_link?: string | null
          web_view_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_drive_files_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string
          email: string | null
          event_id: string
          id: string
          is_organizer: boolean | null
          name: string | null
          org_id: string
          response_time: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id: string
          id?: string
          is_organizer?: boolean | null
          name?: string | null
          org_id: string
          response_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string
          id?: string
          is_organizer?: boolean | null
          name?: string | null
          org_id?: string
          response_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_sent: boolean | null
          reminder_time: string
          reminder_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_sent?: boolean | null
          reminder_time: string
          reminder_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_sent?: boolean | null
          reminder_time?: string
          reminder_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      instantly_integrations: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          id: string
          is_enabled: boolean
          last_sync_at: string | null
          org_id: string
          status: string
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          org_id: string
          status?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          org_id?: string
          status?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instantly_integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      instantly_unibox_events: {
        Row: {
          body_text: string | null
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          lead_id: string | null
          org_id: string
          payload: Json
          phone: string | null
          processed: boolean
          processed_at: string | null
          received_at: string
          sender_email: string | null
          sender_name: string | null
          subject: string | null
        }
        Insert: {
          body_text?: string | null
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          lead_id?: string | null
          org_id: string
          payload?: Json
          phone?: string | null
          processed?: boolean
          processed_at?: string | null
          received_at?: string
          sender_email?: string | null
          sender_name?: string | null
          subject?: string | null
        }
        Update: {
          body_text?: string | null
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          lead_id?: string | null
          org_id?: string
          payload?: Json
          phone?: string | null
          processed?: boolean
          processed_at?: string | null
          received_at?: string
          sender_email?: string | null
          sender_name?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instantly_unibox_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instantly_unibox_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      instantly_webhook_health: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          last_received_at: string | null
          org_id: string
          status: string
          total_failed: number
          total_processed: number
          total_received: number
          updated_at: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_received_at?: string | null
          org_id: string
          status?: string
          total_failed?: number
          total_processed?: number
          total_received?: number
          updated_at?: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_received_at?: string | null
          org_id?: string
          status?: string
          total_failed?: number
          total_processed?: number
          total_received?: number
          updated_at?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "instantly_webhook_health_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scoring_rules: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          rule_type: string
          score_delta: number
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          rule_type: string
          score_delta?: number
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          rule_type?: string
          score_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_scoring_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          agent_name: string | null
          assigned_to: string | null
          company_email: string | null
          company_id: string | null
          company_name: string | null
          company_phone: string | null
          company_size: string | null
          contact_id: string | null
          created_at: string
          currency: string | null
          customer_type: string | null
          decision_maker: string | null
          designation: string | null
          email: string | null
          email_type: string | null
          expected_close_date: string | null
          first_conversion_date: string | null
          id: string
          interaction_notes: string | null
          last_contacted_date: string | null
          lead_score: number | null
          lifecycle_stage: string | null
          next_follow_up_date: string | null
          notes: string | null
          org_id: string
          phone: string | null
          phone_type: string | null
          pipeline: string | null
          priority: string | null
          recent_conversion_date: string | null
          responsible_person: string | null
          service_interested: string | null
          source: string | null
          source_info: string | null
          stage: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          value: number | null
          website: string | null
          website_type: string | null
        }
        Insert: {
          address?: string | null
          agent_name?: string | null
          assigned_to?: string | null
          company_email?: string | null
          company_id?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_size?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          customer_type?: string | null
          decision_maker?: string | null
          designation?: string | null
          email?: string | null
          email_type?: string | null
          expected_close_date?: string | null
          first_conversion_date?: string | null
          id?: string
          interaction_notes?: string | null
          last_contacted_date?: string | null
          lead_score?: number | null
          lifecycle_stage?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          org_id: string
          phone?: string | null
          phone_type?: string | null
          pipeline?: string | null
          priority?: string | null
          recent_conversion_date?: string | null
          responsible_person?: string | null
          service_interested?: string | null
          source?: string | null
          source_info?: string | null
          stage?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          value?: number | null
          website?: string | null
          website_type?: string | null
        }
        Update: {
          address?: string | null
          agent_name?: string | null
          assigned_to?: string | null
          company_email?: string | null
          company_id?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_size?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          customer_type?: string | null
          decision_maker?: string | null
          designation?: string | null
          email?: string | null
          email_type?: string | null
          expected_close_date?: string | null
          first_conversion_date?: string | null
          id?: string
          interaction_notes?: string | null
          last_contacted_date?: string | null
          lead_score?: number | null
          lifecycle_stage?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          org_id?: string
          phone?: string | null
          phone_type?: string | null
          pipeline?: string | null
          priority?: string | null
          recent_conversion_date?: string | null
          responsible_person?: string | null
          service_interested?: string | null
          source?: string | null
          source_info?: string | null
          stage?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          value?: number | null
          website?: string | null
          website_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaign_events: {
        Row: {
          campaign_id: string
          contact_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          lead_id: string | null
          link_url: string | null
          org_id: string
          user_agent: string | null
        }
        Insert: {
          campaign_id: string
          contact_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          link_url?: string | null
          org_id: string
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string
          contact_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          link_url?: string | null
          org_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaign_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaign_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaign_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          ab_parent_id: string | null
          ab_variant: string | null
          actual_spend: number | null
          body_html: string | null
          body_text: string | null
          budget: number | null
          budget_currency: string | null
          campaign_type: string
          channel: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          from_email: string | null
          from_name: string | null
          id: string
          is_ab_test: boolean | null
          list_id: string | null
          metadata: Json | null
          name: string
          org_id: string
          preview_text: string | null
          reply_to: string | null
          revenue_attributed: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject_line: string | null
          tags: string[] | null
          total_bounced: number | null
          total_clicked: number | null
          total_conversions: number | null
          total_delivered: number | null
          total_opened: number | null
          total_sent: number | null
          total_unsubscribed: number | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          ab_parent_id?: string | null
          ab_variant?: string | null
          actual_spend?: number | null
          body_html?: string | null
          body_text?: string | null
          budget?: number | null
          budget_currency?: string | null
          campaign_type?: string
          channel?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_ab_test?: boolean | null
          list_id?: string | null
          metadata?: Json | null
          name: string
          org_id: string
          preview_text?: string | null
          reply_to?: string | null
          revenue_attributed?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject_line?: string | null
          tags?: string[] | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_conversions?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          ab_parent_id?: string | null
          ab_variant?: string | null
          actual_spend?: number | null
          body_html?: string | null
          body_text?: string | null
          budget?: number | null
          budget_currency?: string | null
          campaign_type?: string
          channel?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_ab_test?: boolean | null
          list_id?: string | null
          metadata?: Json | null
          name?: string
          org_id?: string
          preview_text?: string | null
          reply_to?: string | null
          revenue_attributed?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject_line?: string | null
          tags?: string[] | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_conversions?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_ab_parent_id_fkey"
            columns: ["ab_parent_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "marketing_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_form_submissions: {
        Row: {
          contact_id: string | null
          converted: boolean | null
          created_at: string
          form_id: string
          id: string
          ip_address: string | null
          lead_id: string | null
          org_id: string
          source_url: string | null
          submission_data: Json
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          contact_id?: string | null
          converted?: boolean | null
          created_at?: string
          form_id: string
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          org_id: string
          source_url?: string | null
          submission_data?: Json
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          contact_id?: string | null
          converted?: boolean | null
          created_at?: string
          form_id?: string
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          org_id?: string
          source_url?: string | null
          submission_data?: Json
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_form_submissions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "marketing_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_form_submissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_form_submissions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_forms: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          embed_code: string | null
          fields: Json
          form_type: string | null
          id: string
          is_active: boolean | null
          lifecycle_stage_on_submit: string | null
          name: string
          org_id: string
          settings: Json | null
          styling: Json | null
          submission_count: number | null
          target_list_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          embed_code?: string | null
          fields?: Json
          form_type?: string | null
          id?: string
          is_active?: boolean | null
          lifecycle_stage_on_submit?: string | null
          name: string
          org_id: string
          settings?: Json | null
          styling?: Json | null
          submission_count?: number | null
          target_list_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          embed_code?: string | null
          fields?: Json
          form_type?: string | null
          id?: string
          is_active?: boolean | null
          lifecycle_stage_on_submit?: string | null
          name?: string
          org_id?: string
          settings?: Json | null
          styling?: Json | null
          submission_count?: number | null
          target_list_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_forms_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_forms_target_list_id_fkey"
            columns: ["target_list_id"]
            isOneToOne: false
            referencedRelation: "marketing_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_lifecycle_stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          org_id: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          org_id: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          org_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketing_lifecycle_stages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_list_members: {
        Row: {
          added_at: string
          added_by: string | null
          contact_id: string | null
          id: string
          lead_id: string | null
          list_id: string
          org_id: string
          status: string | null
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          contact_id?: string | null
          id?: string
          lead_id?: string | null
          list_id: string
          org_id: string
          status?: string | null
        }
        Update: {
          added_at?: string
          added_by?: string | null
          contact_id?: string | null
          id?: string
          lead_id?: string | null
          list_id?: string
          org_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_list_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_list_members_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "marketing_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_list_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_lists: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          filter_criteria: Json | null
          id: string
          is_active: boolean | null
          list_type: string
          member_count: number | null
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          list_type?: string
          member_count?: number | null
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          list_type?: string
          member_count?: number | null
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_lists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_sequence_enrollments: {
        Row: {
          completed_at: string | null
          contact_id: string | null
          current_step_id: string | null
          enrolled_at: string
          id: string
          lead_id: string | null
          metadata: Json | null
          next_action_at: string | null
          org_id: string
          sequence_id: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          contact_id?: string | null
          current_step_id?: string | null
          enrolled_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          next_action_at?: string | null
          org_id: string
          sequence_id: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          contact_id?: string | null
          current_step_id?: string | null
          enrolled_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          next_action_at?: string | null
          org_id?: string
          sequence_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_sequence_enrollments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_sequence_enrollments_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "marketing_sequence_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_sequence_enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_sequence_enrollments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "marketing_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_sequence_steps: {
        Row: {
          created_at: string
          delay_minutes: number | null
          id: string
          org_id: string
          sequence_id: string
          sort_order: number
          step_config: Json
          step_type: string
        }
        Insert: {
          created_at?: string
          delay_minutes?: number | null
          id?: string
          org_id: string
          sequence_id: string
          sort_order?: number
          step_config?: Json
          step_type: string
        }
        Update: {
          created_at?: string
          delay_minutes?: number | null
          id?: string
          org_id?: string
          sequence_id?: string
          sort_order?: number
          step_config?: Json
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_sequence_steps_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "marketing_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_sequences: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          enrollment_count: number | null
          goal_criteria: Json | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          enrollment_count?: number | null
          goal_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          enrollment_count?: number | null
          goal_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_sequences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onedrive_connections: {
        Row: {
          access_token: string | null
          created_at: string
          drive_id: string | null
          drive_name: string | null
          id: string
          last_sync_at: string | null
          microsoft_email: string | null
          org_id: string
          refresh_token: string | null
          sync_enabled: boolean | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          drive_id?: string | null
          drive_name?: string | null
          id?: string
          last_sync_at?: string | null
          microsoft_email?: string | null
          org_id: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          drive_id?: string | null
          drive_name?: string | null
          id?: string
          last_sync_at?: string | null
          microsoft_email?: string | null
          org_id?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onedrive_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onedrive_files: {
        Row: {
          connection_id: string | null
          created_at: string
          download_url: string | null
          file_id: string
          id: string
          last_modified: string | null
          mime_type: string | null
          name: string
          org_id: string | null
          parent_reference: Json | null
          path: string | null
          size: number | null
          updated_at: string
          user_id: string | null
          web_url: string | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          download_url?: string | null
          file_id: string
          id?: string
          last_modified?: string | null
          mime_type?: string | null
          name: string
          org_id?: string | null
          parent_reference?: Json | null
          path?: string | null
          size?: number | null
          updated_at?: string
          user_id?: string | null
          web_url?: string | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          download_url?: string | null
          file_id?: string
          id?: string
          last_modified?: string | null
          mime_type?: string | null
          name?: string
          org_id?: string | null
          parent_reference?: Json | null
          path?: string | null
          size?: number | null
          updated_at?: string
          user_id?: string | null
          web_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onedrive_files_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "onedrive_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onedrive_files_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_join_requests: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          org_id: string
          rejection_reason: string | null
          requested_role: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          org_id: string
          rejection_reason?: string | null
          requested_role?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          org_id?: string
          rejection_reason?: string | null
          requested_role?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_join_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      permission_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          org_id: string
          target_id: string | null
          target_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          org_id: string
          target_id?: string | null
          target_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string
          target_id?: string | null
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string
          id: string
          module_name: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string
          id?: string
          module_name: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string
          id?: string
          module_name?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "permissions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_system: boolean
          org_id: string
          pipeline: string
          sort_order: number
          stage_key: string
          stage_label: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_system?: boolean
          org_id: string
          pipeline?: string
          sort_order?: number
          stage_key: string
          stage_label: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_system?: boolean
          org_id?: string
          pipeline?: string
          sort_order?: number
          stage_key?: string
          stage_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          added_at: string | null
          added_by_admin: boolean | null
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          job_title: string | null
          org_id: string | null
          password_change_required: boolean | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          added_at?: string | null
          added_by_admin?: boolean | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id: string
          job_title?: string | null
          org_id?: string | null
          password_change_required?: boolean | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          added_at?: string | null
          added_by_admin?: boolean | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          job_title?: string | null
          org_id?: string | null
          password_change_required?: boolean | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invoices: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          line_items: Json | null
          notes: string | null
          org_id: string
          paid_at: string | null
          project_id: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by: string
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          line_items?: Json | null
          notes?: string | null
          org_id: string
          paid_at?: string | null
          project_id: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          line_items?: Json | null
          notes?: string | null
          org_id?: string
          paid_at?: string | null
          project_id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          metadata: Json | null
          org_id: string
          project_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json | null
          org_id: string
          project_id: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json | null
          org_id?: string
          project_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_risks: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          mitigation_plan: string | null
          org_id: string
          project_id: string
          reported_by: string
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          mitigation_plan?: string | null
          org_id: string
          project_id: string
          reported_by: string
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          mitigation_plan?: string | null
          org_id?: string
          project_id?: string
          reported_by?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_risks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_shares: {
        Row: {
          client_email: string | null
          client_name: string | null
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          org_id: string
          permissions: Json | null
          project_id: string
          share_token: string
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          org_id: string
          permissions?: Json | null
          project_id: string
          share_token?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          org_id?: string
          permissions?: Json | null
          project_id?: string
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_shares_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_templates: {
        Row: {
          created_at: string
          created_by: string
          default_milestones: Json | null
          default_tasks: Json | null
          description: string | null
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          default_milestones?: Json | null
          default_tasks?: Json | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          default_milestones?: Json | null
          default_tasks?: Json | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          budget_currency: string | null
          color: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          org_id: string
          owner_id: string
          priority: string
          progress: number
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          budget_currency?: string | null
          color?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          org_id: string
          owner_id: string
          priority?: string
          progress?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          budget_currency?: string | null
          color?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          org_id?: string
          owner_id?: string
          priority?: string
          progress?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rc_webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          org_id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          rc_call_id: string | null
          retry_count: number
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          org_id: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          rc_call_id?: string | null
          retry_count?: number
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          org_id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          rc_call_id?: string | null
          retry_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "rc_webhook_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rc_webhook_health: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          last_event_at: string | null
          org_id: string
          status: string
          subscription_id: string | null
          total_failed: number
          total_processed: number
          total_received: number
          updated_at: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_event_at?: string | null
          org_id: string
          status?: string
          subscription_id?: string | null
          total_failed?: number
          total_processed?: number
          total_received?: number
          updated_at?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_event_at?: string | null
          org_id?: string
          status?: string
          subscription_id?: string | null
          total_failed?: number
          total_processed?: number
          total_received?: number
          updated_at?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "rc_webhook_health_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ringcentral_tokens: {
        Row: {
          access_token: string
          created_at: string
          id: string
          org_id: string
          rc_account_id: string | null
          rc_extension_id: string | null
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          org_id: string
          rc_account_id?: string | null
          rc_extension_id?: string | null
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          org_id?: string
          rc_account_id?: string | null
          rc_extension_id?: string | null
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ringcentral_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          created_at: string
          id: string
          is_granted: boolean
          module: string
          role_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          is_granted?: boolean
          module: string
          role_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          is_granted?: boolean
          module?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          org_id: string
          parent_role_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          org_id: string
          parent_role_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          org_id?: string
          parent_role_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_parent_role_id_fkey"
            columns: ["parent_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          dependency_type: string
          depends_on_task_id: string
          id: string
          org_id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          dependency_type?: string
          depends_on_task_id: string
          id?: string
          org_id: string
          task_id: string
        }
        Update: {
          created_at?: string
          dependency_type?: string
          depends_on_task_id?: string
          id?: string
          org_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          entity_id: string | null
          entity_type: string | null
          estimated_hours: number | null
          id: string
          org_id: string
          parent_task_id: string | null
          priority: string
          project_id: string | null
          recurrence_parent_id: string | null
          recurrence_rule: string | null
          sort_order: number | null
          start_date: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          estimated_hours?: number | null
          id?: string
          org_id: string
          parent_task_id?: string | null
          priority?: string
          project_id?: string | null
          recurrence_parent_id?: string | null
          recurrence_rule?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          estimated_hours?: number | null
          id?: string
          org_id?: string
          parent_task_id?: string | null
          priority?: string
          project_id?: string | null
          recurrence_parent_id?: string | null
          recurrence_rule?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      telephony_providers: {
        Row: {
          config: Json | null
          created_at: string
          display_name: string
          id: string
          is_enabled: boolean
          org_id: string
          provider_name: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          display_name: string
          id?: string
          is_enabled?: boolean
          org_id: string
          provider_name: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          is_enabled?: boolean
          org_id?: string
          provider_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telephony_providers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          ended_at: string | null
          id: string
          is_running: boolean | null
          org_id: string
          started_at: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          is_running?: boolean | null
          org_id: string
          started_at?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          is_running?: boolean | null
          org_id?: string
          started_at?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      unibox_emails: {
        Row: {
          body_html: string | null
          body_text: string | null
          converted_at: string | null
          converted_by: string | null
          converted_to_lead_id: string | null
          created_at: string
          id: string
          org_id: string
          phone: string | null
          raw_webhook_data: Json | null
          received_at: string
          sender_email: string
          sender_name: string | null
          status: string
          subject: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          converted_at?: string | null
          converted_by?: string | null
          converted_to_lead_id?: string | null
          created_at?: string
          id?: string
          org_id: string
          phone?: string | null
          raw_webhook_data?: Json | null
          received_at?: string
          sender_email: string
          sender_name?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          converted_at?: string | null
          converted_by?: string | null
          converted_to_lead_id?: string | null
          created_at?: string
          id?: string
          org_id?: string
          phone?: string | null
          raw_webhook_data?: Json | null
          received_at?: string
          sender_email?: string
          sender_name?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unibox_emails_converted_to_lead_id_fkey"
            columns: ["converted_to_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unibox_emails_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          role_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          role_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          role_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_telephony_preferences: {
        Row: {
          active_provider: string | null
          created_at: string
          id: string
          org_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_provider?: string | null
          created_at?: string
          id?: string
          org_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_provider?: string | null
          created_at?: string
          id?: string
          org_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_telephony_preferences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_actions: {
        Row: {
          action_config: Json
          action_type: string
          condition_config: Json | null
          created_at: string
          id: string
          org_id: string
          sort_order: number
          workflow_id: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          condition_config?: Json | null
          created_at?: string
          id?: string
          org_id: string
          sort_order?: number
          workflow_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          condition_config?: Json | null
          created_at?: string
          id?: string
          org_id?: string
          sort_order?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_actions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_actions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          execution_log: Json | null
          id: string
          org_id: string
          started_at: string
          status: string
          trigger_event: Json
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          execution_log?: Json | null
          id?: string
          org_id: string
          started_at?: string
          status?: string
          trigger_event?: Json
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          execution_log?: Json | null
          id?: string
          org_id?: string
          started_at?: string
          status?: string
          trigger_event?: Json
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workgroup_members: {
        Row: {
          id: string
          joined_at: string
          org_id: string
          role: string
          user_id: string
          workgroup_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          org_id: string
          role?: string
          user_id: string
          workgroup_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          org_id?: string
          role?: string
          user_id?: string
          workgroup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workgroup_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workgroup_members_workgroup_id_fkey"
            columns: ["workgroup_id"]
            isOneToOne: false
            referencedRelation: "workgroups"
            referencedColumns: ["id"]
          },
        ]
      }
      workgroup_posts: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          is_edited: boolean | null
          is_pinned: boolean | null
          org_id: string
          parent_id: string | null
          updated_at: string
          user_id: string
          workgroup_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          org_id: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
          workgroup_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          org_id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
          workgroup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workgroup_posts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workgroup_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "workgroup_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workgroup_posts_workgroup_id_fkey"
            columns: ["workgroup_id"]
            isOneToOne: false
            referencedRelation: "workgroups"
            referencedColumns: ["id"]
          },
        ]
      }
      workgroups: {
        Row: {
          avatar_color: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_archived: boolean | null
          name: string
          org_id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          avatar_color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          org_id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          org_id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workgroups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_permission: {
        Args: { _action: string; _module: string; _user_id: string }
        Returns: boolean
      }
      check_role_permission: {
        Args: { _action: string; _module: string; _user_id: string }
        Returns: boolean
      }
      get_effective_permissions: {
        Args: { _role_id: string }
        Returns: {
          action: string
          is_inherited: boolean
          module: string
          source_role_id: string
        }[]
      }
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: { Args: { _user_id: string }; Returns: boolean }
      user_belongs_to_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_profile: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "sales_rep"
        | "hr_manager"
        | "inventory_manager"
        | "employee"
        | "manager"
      drive_access_level:
        | "read_only"
        | "upload"
        | "download"
        | "edit"
        | "full_access"
      drive_ownership: "company" | "personal"
      drive_type:
        | "google_drive"
        | "onedrive"
        | "icloud"
        | "network_smb"
        | "network_nfs"
        | "network_webdav"
        | "network_sftp"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "sales_rep",
        "hr_manager",
        "inventory_manager",
        "employee",
        "manager",
      ],
      drive_access_level: [
        "read_only",
        "upload",
        "download",
        "edit",
        "full_access",
      ],
      drive_ownership: ["company", "personal"],
      drive_type: [
        "google_drive",
        "onedrive",
        "icloud",
        "network_smb",
        "network_nfs",
        "network_webdav",
        "network_sftp",
      ],
    },
  },
} as const
