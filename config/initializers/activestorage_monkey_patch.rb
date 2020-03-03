module ActiveStorage
  class Attached::Changes::CreateOne #:nodoc:
    private
      def find_or_build_blob
        case attachable
        when ActiveStorage::Blob
          attachable
        when ActionDispatch::Http::UploadedFile, Rack::Test::UploadedFile
          ActiveStorage::Blob.build_after_unfurling \
            io: attachable.open,
            filename: attachable.original_filename,
            content_type: attachable.content_type
        when Hash
          ActiveStorage::Blob.build_after_unfurling(attachable)
        when String
          blob_from_json_attachable || ActiveStorage::Blob.find_signed(attachable)
        else
          raise ArgumentError, "Could not find or build blob: expected attachable, got #{attachable.inspect}"
        end
      end

      def blob_from_json_attachable
        json = attachable_json
        return nil if json.nil?
        return nil unless json.key?('key_name')

        ActiveStorage::Blob.new(
          key: json['key_name'],
          filename: json['filename'],
          content_type: json['content_type'],
          byte_size: json['byte_size'],
          checksum: [[json['etag'].remove(/\"/)].pack('H*')].pack('m0')
        )
      end

      def attachable_json
        result = JSON.parse(attachable)
        return result if result.is_a?(Hash)

        nil
      rescue JSON::ParserError, TypeError
        nil
      end
  end
end